import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, Slide, useMediaQuery, useTheme } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { ChatImage, chatWithAgent, invalidateAll } from '../../Api/Api';
import { useTravel } from '../../Contexts/TravelContext';
import { useMessage } from '../../Contexts/NotifContext';
import { Perf, Stamp } from '../Design/Atoms';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  imageCount?: number;
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

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const MAX_IMAGES = 4;
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

interface AttachedImage {
  id: string;
  data: string;         // base64 (no data: prefix)
  media_type: string;
  previewUrl: string;   // object URL for the <img>
  name: string;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const r = String(reader.result || '');
      // strip "data:image/...;base64," prefix
      const i = r.indexOf(',');
      resolve(i >= 0 ? r.slice(i + 1) : r);
    };
    reader.readAsDataURL(file);
  });

const ChatDialog: React.FC<ChatDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const travelCtx = useTravel();
  const { setPayload } = useMessage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [attached, setAttached] = useState<AttachedImage[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, busy]);

  // Revoke object URLs on unmount to avoid leaks.
  useEffect(
    () => () => {
      attached.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const addFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) return;
      // Filter to image types we can send.
      const usable = files.filter((f) => ACCEPTED_TYPES.includes(f.type));
      if (!usable.length) {
        setPayload({ type: 'warning', message: 'Only PNG/JPEG/WebP/GIF images.' });
        return;
      }
      const room = MAX_IMAGES - attached.length;
      if (room <= 0) {
        setPayload({ type: 'warning', message: `At most ${MAX_IMAGES} images per message.` });
        return;
      }
      const accepted = usable.slice(0, room);
      const tooBig = accepted.find((f) => f.size > MAX_BYTES);
      if (tooBig) {
        setPayload({ type: 'error', message: `"${tooBig.name}" is over 5 MB.` });
        return;
      }
      const items = await Promise.all(
        accepted.map(async (file, i) => {
          const data = await fileToBase64(file);
          return {
            id: `${Date.now()}-${i}-${file.name}`,
            data,
            media_type: file.type,
            previewUrl: URL.createObjectURL(file),
            name: file.name || 'image',
          };
        }),
      );
      setAttached((prev) => [...prev, ...items]);
    },
    [attached.length, setPayload],
  );

  const removeAttachment = (id: string) => {
    setAttached((prev) => {
      const goner = prev.find((p) => p.id === id);
      if (goner) URL.revokeObjectURL(goner.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  const send = useCallback(async () => {
    const text = input.trim();
    const tripId = travelCtx.state.chosenTrip?.tripIdShared;
    if (busy || !tripId || (!text && attached.length === 0)) return;

    const outgoingImages: ChatImage[] = attached.map((a) => ({
      data: a.data,
      media_type: a.media_type,
    }));
    const localUserContent = text || `(${attached.length} image${attached.length === 1 ? '' : 's'} attached)`;
    const imageCount = attached.length;

    // Clear inputs immediately — and revoke preview URLs after they're
    // no longer needed for the user's own bubble.
    setInput('');
    attached.forEach((a) => URL.revokeObjectURL(a.previewUrl));
    setAttached([]);

    setMessages((prev) => [...prev, { role: 'user', content: localUserContent, imageCount }]);
    setBusy(true);

    // Read the prior history right before the user turn so we don't
    // re-send the just-pushed message to the backend (the backend
    // expects history to be everything BEFORE this turn).
    let priorHistory: ChatMessage[] = [];
    setMessages((prev) => {
      priorHistory = prev.slice(0, -1);
      return prev;
    });

    try {
      const res = await chatWithAgent(tripId, text, priorHistory, outgoingImages);
      const payload = res.data?.Message ?? {};
      const reply: string = payload.reply || '(no reply)';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      if (payload.error) setPayload({ type: 'error', message: payload.error });
      if (Array.isArray(payload.mutations) && payload.mutations.length > 0) {
        invalidateAll();
        travelCtx.state.refreshData?.();
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.Error || e?.message || 'Could not reach the clerk.';
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${msg}` }]);
      setPayload({ type: 'error', message: msg });
    } finally {
      setBusy(false);
    }
  }, [input, attached, busy, travelCtx, setPayload]);

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const files: File[] = [];
    for (const item of Array.from(e.clipboardData.items)) {
      if (item.kind === 'file') {
        const f = item.getAsFile();
        if (f) files.push(f);
      }
    }
    if (files.length) {
      e.preventDefault();
      addFiles(files);
    }
  };

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
    if (e.target) e.target.value = ''; // reset so picking the same file again still fires onChange
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
          role="log"
          aria-live="polite"
          aria-label="Assistant conversation"
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
                <br />
                <span style={{ fontSize: 14 }}>
                  Or paste a receipt photo with a one-line description.
                </span>
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
                {m.imageCount ? ` · ${m.imageCount} image${m.imageCount === 1 ? '' : 's'}` : ''}
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

        {/* Attachment thumbnails */}
        {attached.length > 0 && (
          <div
            style={{
              padding: '10px 18px 0',
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            {attached.map((a) => (
              <div
                key={a.id}
                style={{
                  position: 'relative',
                  width: 64,
                  height: 64,
                  border: '1px solid var(--ink)',
                  background: 'var(--paper-deep)',
                }}
              >
                <img
                  src={a.previewUrl}
                  alt={a.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <button
                  type="button"
                  onClick={() => removeAttachment(a.id)}
                  aria-label={`Remove ${a.name}`}
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'var(--stamp)',
                    color: 'var(--paper)',
                    border: '1px solid var(--paper)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    lineHeight: '18px',
                    padding: 0,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input row */}
        <div
          style={{
            padding: '12px 18px 14px',
            display: 'flex',
            gap: 8,
            alignItems: 'flex-end',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            multiple
            hidden
            onChange={onPickFiles}
          />
          <button
            type="button"
            className="ts-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy || attached.length >= MAX_IMAGES}
            aria-label="Attach image"
            title={
              attached.length >= MAX_IMAGES
                ? `At most ${MAX_IMAGES} images per message`
                : 'Attach image (PNG/JPEG/WebP/GIF, ≤5 MB each)'
            }
            style={{ padding: '10px 12px', fontSize: 14 }}
          >
            📎
          </button>
          <textarea
            placeholder={
              attached.length > 0
                ? 'Describe the receipt or how to split…'
                : 'Dictate your message (paste a photo to attach)…'
            }
            value={input}
            disabled={busy}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            onPaste={onPaste}
            rows={2}
            autoFocus
            aria-label="Message the trip assistant"
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
            disabled={busy || (!input.trim() && attached.length === 0)}
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
