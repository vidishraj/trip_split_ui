import React, { useEffect, useState } from 'react';
import { Dialog } from '@mui/material';
import { useMessage } from '../../Contexts/NotifContext';
import { updateTripTitle } from '../../Api/Api';
import { TripData, MessageContextType } from '../../Assets/types';
import { Perf } from '../Design/Atoms';

interface EditTripDialogProps {
  editData: TripData | undefined;
  open: boolean;
  handleClose: () => void;
  refetchTrips: () => void;
}

export const EditTripDialog: React.FC<EditTripDialogProps> = ({
  editData,
  open,
  handleClose,
  refetchTrips,
}) => {
  const [title, setTitle] = useState<string>('');
  const notif: MessageContextType = useMessage();

  useEffect(() => {
    if (editData && open) setTitle(editData.tripTitle);
  }, [editData, open]);

  const save = () => {
    if (!editData) return;
    updateTripTitle(title, editData.tripIdShared)
      .then(() => {
        refetchTrips();
        notif.setPayload({ type: 'success', message: 'Title amended.' });
      })
      .catch(() =>
        notif.setPayload({ type: 'error', message: 'Could not amend title.' }),
      );
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { background: 'transparent', boxShadow: 'none', overflow: 'visible' } }}
    >
      <div className="ts-paper" style={{ padding: '28px 30px', position: 'relative' }}>
        <div className="ts-eyebrow" style={{ marginBottom: 6 }}>Amendment</div>
        <h2
          className="ts-display"
          style={{
            margin: 0,
            marginBottom: 18,
            fontSize: 26,
            fontVariationSettings: '"SOFT" 30, "opsz" 144',
          }}
        >
          Edit trip title.
        </h2>

        <div style={{ marginBottom: 18 }}>
          <label className="ts-label">New title</label>
          <input
            className="ts-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        <Perf style={{ margin: '6px 0 14px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <button className="ts-btn" onClick={handleClose}>Cancel</button>
          <button
            className="ts-btn ts-btn-ink"
            onClick={save}
            disabled={!editData || title === editData.tripTitle}
          >
            File amendment
          </button>
        </div>
      </div>
    </Dialog>
  );
};
