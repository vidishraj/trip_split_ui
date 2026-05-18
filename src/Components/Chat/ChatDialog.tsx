import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  CircularProgress,
  Dialog,
  IconButton,
  Slide,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { Close, Send, AutoAwesome } from '@mui/icons-material';
import { chatWithAgent } from '../../Api/Api';
import { useTravel } from '../../Contexts/TravelContext';
import { useMessage } from '../../Contexts/NotifContext';

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
  ref: React.Ref<unknown>
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
      if (payload.error) {
        setPayload({ type: 'error', message: payload.error });
      }
      if (Array.isArray(payload.mutations) && payload.mutations.length > 0) {
        // Backend told us something changed; refresh dashboard data.
        const refresh = travelCtx.state.refreshData;
        if (typeof refresh === 'function') refresh();
      }
    } catch (e: any) {
      const msg = e?.response?.data?.Error || e?.message || 'Chat failed';
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
          width: isMobile ? '100%' : 480,
          height: isMobile ? '100%' : 600,
          borderRadius: isMobile ? 0 : '16px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.25,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: '#fff',
        }}
      >
        <AutoAwesome fontSize="small" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600, flexGrow: 1 }}>
          Trip assistant
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: '#fff' }}>
          <Close />
        </IconButton>
      </Box>

      <Box
        ref={listRef}
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          backgroundColor: '#f5f7fa',
        }}
      >
        {messages.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
            Try: "Add ₹500 dinner split equally between me, Alice, and Bob"
            <br />
            or "How much do I owe?"
          </Typography>
        )}
        {messages.map((m, i) => (
          <Box
            key={i}
            sx={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              px: 1.5,
              py: 1,
              borderRadius: '12px',
              backgroundColor: m.role === 'user' ? '#1976d2' : '#fff',
              color: m.role === 'user' ? '#fff' : '#1a1a1a',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontSize: '0.92rem',
            }}
          >
            {m.content}
          </Box>
        ))}
        {busy && (
          <Box sx={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={14} />
            <Typography variant="caption" color="text.secondary">
              thinking...
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ p: 1.5, display: 'flex', gap: 1, borderTop: '1px solid #e0e0e0', backgroundColor: '#fff' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Ask or describe an expense..."
          value={input}
          disabled={busy}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          multiline
          maxRows={4}
        />
        <Tooltip title="Send">
          <span>
            <IconButton color="primary" disabled={busy || !input.trim()} onClick={send}>
              <Send />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Dialog>
  );
};

export default ChatDialog;
