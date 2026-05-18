import React from 'react';
import { Dialog } from '@mui/material';
import { Perf } from './Design/Atoms';

interface ConfirmationDialogProps {
  message: string;
  onSubmit: () => void;
  onCancel: () => void;
  open: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  message,
  onSubmit,
  onCancel,
  open,
}) => (
  <Dialog
    open={open}
    onClose={onCancel}
    fullWidth
    maxWidth="xs"
    PaperProps={{ sx: { background: 'transparent', boxShadow: 'none', overflow: 'visible' } }}
  >
    <div className="ts-paper" style={{ padding: '24px 28px' }}>
      <div className="ts-eyebrow" style={{ marginBottom: 6 }}>Confirm</div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22,
          lineHeight: 1.25,
          color: 'var(--ink)',
        }}
      >
        {message}
      </div>
      <Perf style={{ margin: '18px 0' }} />
      <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <button className="ts-btn" onClick={onCancel}>Cancel</button>
        <button className="ts-btn ts-btn-stamp" onClick={onSubmit}>Confirm ↗</button>
      </div>
    </div>
  </Dialog>
);

export default ConfirmationDialog;
