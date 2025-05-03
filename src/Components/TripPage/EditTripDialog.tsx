// EditTripDialog.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import { useMessage } from '../../Contexts/NotifContext';
import { updateTripTitle } from '../../Api/Api';
import { TripData, MessageContextType } from '../../Assets/types';

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
  const [editedTripTitle, setEditedTripTitle] = useState<string>('');
  const notif: MessageContextType = useMessage();

  useEffect(() => {
    if (editData && open) {
      setEditedTripTitle(editData.tripTitle);
    }
  }, [editData, open]);

  const handleEditSave = (): void => {
    if (!editData) return;

    updateTripTitle(editedTripTitle, editData.tripIdShared)
      .then(() => {
        refetchTrips();
        notif.setPayload({
          type: 'success',
          message: 'Trip title updated successfully.',
        });
      })
      .catch(() => {
        notif.setPayload({
          type: 'error',
          message: 'Error editing trip title.',
        });
      });
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Trip Title</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Trip Title"
          type="text"
          fullWidth
          variant="outlined"
          value={editedTripTitle}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEditedTripTitle(e.target.value)
          }
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleEditSave}
          disabled={!editData || editedTripTitle === editData.tripTitle}
        >
          Save Changes
        </Button>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};
