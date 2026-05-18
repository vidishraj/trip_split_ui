import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, Slide, useMediaQuery, useTheme } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { chatWithAgent } from '../../Api/Api';
import { useTravel } from '../../Contexts/TravelContext';
import { useMessage } from '../../Contexts/NotifContext';
import { Perf, Stamp } from '../Design/Atoms';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatDialogProps {
  open: boolean;
  onClose: () => void;
}

const SlideUp = React.forwardRef(function SlideUp(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ChatDialog: React.FC<ChatDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const travelCtx = useTravel();
  const { setPayload } = useMessage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, busy]);

  const send = useCallback(async () => {
    const text = input.trim();
    const tripId = travelCtx.state.chosenTrip?.tripIdShared;
    if (!text || !tripId || busy) return;
    setInput('');
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setBusy(true);
    try {
      const res = await chatWithAgent(tripId, text, messages);
      const payload = res.data?.Message ?? {};
      const reply: string = payload.reply || '(no reply)';
      setMessages([...next, { role: 'assistant', content: reply }]);
      if (payload.error) setPayload({ type: 'error', message: payload.error });
      if (Array.isArray(payload.mutations) && payload.mutations.length > 0) {
        const refresh = travelCtx.state.refreshData;
        if (typeof refresh === 'function') refresh();
      }
    } catch (e: any) {
      const msg = e?.response?.data?.Error || e?.message || 'Could not reach the clerk.';
      setMessages([...next, { role: 'assistant', content: `Error: ${msg}` }]);
      setPayload({ type: 'error', message: msg });
    } finally {
      setBusy(false);
    }
  }, [input, messages, busy, travelCtx, setPayload]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      TransitionComponent={SlideUp}
      PaperProps={{
        sx: {
          width: isMobile ? '100%' : 520,
          height: isMobile ? '100%' : 640,
          borderRadius: 0,
          background: 'transparent',
          boxShadow: 'none',
          overflow: 'visible',
        },
      }}
    >
      <div
        className="ts-paper"
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background:
              'repeating-linear-gradient(90deg, var(--ink) 0 10px, transparent 10px 12px)',
            borderBottom: '1px solid var(--ink)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'var(--ink)',
              color: 'var(--paper)',
              padding: '6px 12px',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, letterSpacing: 0 }}>✦</span>
            Telegraph desk
          </div>
          <button
            className="ts-mono"
            onClick={onClose}
            style={{
              background: 'var(--ink)',
              color: 'var(--paper)',
              padding: '6px 10px',
              fontSize: 10,
              letterSpacing: '0.2em',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            CLOSE
          </button>
        </div>

        {/* Messages */}
        <div
          ref={listRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            backgroundImage:
              'repeating-linear-gradient(to bottom, transparent 0, transparent 30px, rgba(20,17,13,0.06) 31px)',
          }}
        >
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: 28 }}>
              <Stamp text="OPERATOR" date="READY" tone="ledger" size={94} rotate={-7} />
              <div className="ts-eyebrow" style={{ marginTop: 18 }}>Try a message</div>
              <div
                style={{
                  marginTop: 8,
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: 18,
                  color: 'var(--ink-soft)',
                  lineHeight: 1.4,
                }}
              >
                "Add ₹500 dinner split equally between me and Alice."
                <br />
                "How much do I owe?"
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '88%',
              }}
            >
              <div
                className="ts-mono"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-faded)',
                  marginBottom: 4,
                  textAlign: m.role === 'user' ? 'right' : 'left',
                }}
              >
                {m.role === 'user' ? '↑ Bearer' : '↓ Operator'}
              </div>
              <div
                style={{
                  padding: '10px 14px',
                  background: m.role === 'user' ? 'var(--ink)' : 'var(--paper)',
                  color: m.role === 'user' ? 'var(--paper)' : 'var(--ink)',
                  border: m.role === 'user' ? '1px solid var(--ink)' : '1px solid var(--rule-soft)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 15,
                  lineHeight: 1.45,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  boxShadow: '0 2px 4px rgba(20,17,13,0.06)',
                }}
              >
                {m.content}
              </div>
            </div>
          ))}

          {busy && (
            <div
              style={{
                alignSelf: 'flex-start',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span
                className="ts-mono"
                style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--ink-faded)' }}
              >
                ··· tapping the wire ···
              </span>
            </div>
          )}
        </div>

        <Perf style={{ margin: '0 18px' }} />

        {/* Input */}
        <div style={{ padding: '14px 18px', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            placeholder="Dictate your message…"
            value={input}
            disabled={busy}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            rows={2}
            style={{
              flex: 1,
              border: '1px solid var(--ink)',
              padding: '8px 10px',
              background: 'transparent',
              outline: 'none',
              resize: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: 15,
              color: 'var(--ink)',
              minHeight: 38,
              maxHeight: 140,
            }}
          />
          <button
            className="ts-btn ts-btn-ink"
            disabled={busy || !input.trim()}
            onClick={send}
            style={{ padding: '10px 14px' }}
          >
            Send ↗
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default ChatDialog;
