import React from 'react';
import { Dialog } from '@mui/material';
import { useTravel } from '../../../Contexts/TravelContext';
import { sendResponseForTripRequest } from '../../../Api/Api';
import { useMessage } from '../../../Contexts/NotifContext';
import { useLoading } from '../../../Contexts/LoadingContext';
import { Perf, Stamp } from '../../Design/Atoms';

interface UsernameDialogProps {
  open: boolean;
  onClose: () => void;
  username: string;
  setUsername: (value: string) => void;
  handleSubmit: () => void;
}

const UsernameDialog: React.FC<UsernameDialogProps> = ({ open, onClose }) => {
  const travelCtx = useTravel();
  const { setPayload } = useMessage();
  const { setLoading } = useLoading();

  function handleResponse(response: boolean, userId: number) {
    setLoading(true);
    sendResponseForTripRequest({
      response,
      userId,
      tripId: travelCtx.state.chosenTrip?.tripIdShared,
    })
      .then(() => setPayload({ type: 'success', message: 'Response filed.' }))
      .catch(() => setPayload({ type: 'error', message: 'Could not send response.' }))
      .finally(() => setLoading(false));
    onClose();
  }

  const requests = travelCtx.state.tripRequests || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      PaperProps={{ sx: { background: 'transparent', boxShadow: 'none', overflow: 'visible' } }}
    >
      <div className="ts-paper" style={{ padding: '28px 30px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 16,
          }}
        >
          <div>
            <div className="ts-eyebrow">Pending petitions</div>
            <h2
              className="ts-display"
              style={{ margin: '6px 0 0', fontSize: 28, fontVariationSettings: '"SOFT" 30, "opsz" 144' }}
            >
              Requests for entry.
            </h2>
          </div>
          <Stamp text="Inbox" date="·" tone="gold" size={72} rotate={6} />
        </div>

        <Perf />

        <div style={{ marginTop: 12, maxHeight: 420, overflowY: 'auto' }}>
          {requests.length === 0 ? (
            <div style={{ padding: '40px 12px', textAlign: 'center', color: 'var(--ink-faded)' }}>
              <div className="ts-label" style={{ marginBottom: 6 }}>No requests</div>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22 }}>
                The mailbox is quiet.
              </div>
            </div>
          ) : (
            requests.map((item) => (
              <div
                key={item.userId}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 6px',
                  borderBottom: '1px dashed var(--rule-soft)',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 18,
                      fontWeight: 500,
                      lineHeight: 1.15,
                    }}
                  >
                    {item.userName}
                  </div>
                  <div
                    className="ts-mono"
                    style={{
                      fontSize: 12,
                      color: 'var(--ink-faded)',
                      marginTop: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.email}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="ts-btn ts-btn-ink"
                    style={{ padding: '6px 12px', fontSize: 10 }}
                    onClick={() => handleResponse(true, item.userId)}
                  >
                    Admit
                  </button>
                  <button
                    className="ts-btn ts-btn-stamp"
                    style={{ padding: '6px 12px', fontSize: 10 }}
                    onClick={() => handleResponse(false, item.userId)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <Perf style={{ marginTop: 14 }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
          <button className="ts-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </Dialog>
  );
};

export default UsernameDialog;
