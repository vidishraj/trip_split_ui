import React, { useState } from 'react';
import { Dialog } from '@mui/material';
import { useMessage } from '../../Contexts/NotifContext';
import { sendTripRequest } from '../../Api/Api';
import { MessageContextType } from '../../Assets/types';
import { Perf, Stamp } from '../Design/Atoms';

interface ConnectTripDialogProps {
  open: boolean;
  handleClose: () => void;
}

export const ConnectTripDialog: React.FC<ConnectTripDialogProps> = ({
  open,
  handleClose,
}) => {
  const [tripId, setTripId] = useState<string>('');
  const notif: MessageContextType = useMessage();

  const reset = () => {
    setTripId('');
    handleClose();
  };

  const submit = () => {
    if (tripId.length !== 6) {
      notif.setPayload({
        type: 'error',
        message: 'Trip ID must be exactly 6 characters.',
      });
      return;
    }
    sendTripRequest(tripId)
      .then(() => {
        notif.setPayload({
          type: 'success',
          message: 'Request dispatched. The trip owner must admit you.',
        });
        reset();
      })
      .catch(() =>
        notif.setPayload({ type: 'error', message: 'Could not send request.' }),
      );
  };

  return (
    <Dialog
      open={open}
      onClose={reset}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { background: 'transparent', boxShadow: 'none', overflow: 'visible' } }}
    >
      <div className="ts-paper" style={{ padding: '30px 30px 26px', position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '1px solid var(--rule-soft)',
            paddingBottom: 14,
            marginBottom: 18,
          }}
        >
          <div>
            <div className="ts-eyebrow">Request transit</div>
            <h2
              className="ts-display"
              style={{
                margin: '6px 0 0',
                fontSize: 28,
                fontVariationSettings: '"SOFT" 30, "opsz" 144',
              }}
            >
              Join a trip.
            </h2>
          </div>
          <Stamp text="Petition" date="·" tone="teal" size={68} rotate={-7} />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label className="ts-label">Trip ID — six characters</label>
          <input
            className="ts-input ts-mono"
            value={tripId}
            onChange={(e) => setTripId(e.target.value)}
            maxLength={6}
            placeholder="abc·123"
            style={{ fontSize: 22, letterSpacing: '0.18em', textAlign: 'center' }}
          />
        </div>

        <Perf style={{ margin: '6px 0 16px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <button className="ts-btn" onClick={reset}>Cancel</button>
          <button
            className="ts-btn ts-btn-ink"
            onClick={submit}
            disabled={tripId.length !== 6}
          >
            Dispatch request ↗
          </button>
        </div>
      </div>
    </Dialog>
  );
};
