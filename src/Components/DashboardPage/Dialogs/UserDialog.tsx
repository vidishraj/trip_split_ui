import { Dialog } from '@mui/material';
import { useTravel } from '../../../Contexts/TravelContext';
import { useMessage } from '../../../Contexts/NotifContext';
import { deleteUser } from '../../../Api/Api';
import { Perf } from '../../Design/Atoms';

interface NameListDialogProps {
  onClose: () => void;
}

export const NameListDialog: React.FC<NameListDialogProps> = ({ onClose }) => {
  const travelCtx = useTravel();
  const { setPayload } = useMessage();

  function onDelete(userId: string, deletable: boolean) {
    if (deletable && travelCtx.state.chosenTrip?.tripIdShared) {
      deleteUser(userId.toString(), travelCtx.state.chosenTrip?.tripIdShared)
        .then((response) => {
          if (response.data.Message) {
            setPayload({ type: 'success', message: 'Member removed.' });
          } else {
            setPayload({ type: 'warning', message: 'Could not remove member.' });
          }
          travelCtx.state.refreshData();
        })
        .catch(() => setPayload({ type: 'error', message: 'Could not remove member.' }));
    } else {
      setPayload({
        type: 'error',
        message: 'Member has expenses on the ledger — cannot remove.',
      });
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      PaperProps={{ sx: { background: 'transparent', boxShadow: 'none', overflow: 'visible' } }}
    >
      <div className="ts-paper" style={{ padding: '28px 30px' }}>
        <div className="ts-eyebrow">Manifest of bearers</div>
        <h2
          className="ts-display"
          style={{
            margin: '6px 0 16px',
            fontSize: 28,
            fontVariationSettings: '"SOFT" 30, "opsz" 144',
          }}
        >
          Members on this trip.
        </h2>

        <Perf style={{ marginBottom: 6 }} />

        <div style={{ maxHeight: 420, overflowY: 'auto' }}>
          {(travelCtx.state.users || []).map((name: any) => (
            <div
              key={name.userId}
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr auto',
                gap: 14,
                alignItems: 'center',
                padding: '14px 4px',
                borderBottom: '1px dashed var(--rule-soft)',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  background: 'var(--ink)',
                  color: 'var(--paper)',
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  fontSize: 16,
                }}
              >
                {(name.userName || '?').charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 18,
                    fontWeight: 500,
                    lineHeight: 1.15,
                  }}
                >
                  {name.userName}
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
                  {name.email}
                </div>
              </div>
              <button
                className="ts-btn ts-btn-stamp"
                style={{ padding: '6px 12px', fontSize: 10 }}
                disabled={!name.deletable}
                onClick={() => onDelete(name.userId, name.deletable)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <Perf style={{ marginTop: 12, marginBottom: 14 }} />

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="ts-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Dialog>
  );
};
