// CreateTripDialog.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  SelectChangeEvent,
  Theme,
} from '@mui/material';
import { useTheme } from '@mui/material';
import { useMessage } from '../../Contexts/NotifContext';
import { insertTrip } from '../../Api';
import { currencies } from '../../Common/currencyData';
import { MessageContextType } from '../../Common/types'

interface CreateTripDialogProps {
  open: boolean;
  handleClose: () => void;
  refetchTrips: () => void;
}

export const CreateTripDialog: React.FC<CreateTripDialogProps> = ({
                                                                    open,
                                                                    handleClose,
                                                                    refetchTrips
                                                                  }) => {
  const [tripTitle, setTripTitle] = useState<string>('');
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);
  const theme: Theme = useTheme();
  const notif: MessageContextType = useMessage();

  const handleCurrencyChange = (currency: string): void => {
    setSelectedCurrencies((prev) => {
      if (prev.includes(currency)) {
        return prev.filter((c) => c !== currency);
      }
      if (prev.length < 3) {
        return [...prev, currency];
      }
      return prev;
    });
  };

  const createTrip = (): void => {
    insertTrip({
      trip: tripTitle,
      currencies: selectedCurrencies,
    })
      .then((response) => {
        if (response.status === 200) {
          notif.setPayload({
            type: 'success',
            message: 'Successfully created trip.',
          });
        }
        handleClose();
        refetchTrips();
      })
      .catch((error) => {
        notif.setPayload({
          type: 'error',
          message: 'Error creating trip.',
        });
        handleClose();
        console.log(error);
      });
  };

  const resetAndClose = (): void => {
    setTripTitle('');
    setSelectedCurrencies([]);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={resetAndClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Trip</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="trip-title"
          label="Trip Title (min-3)"
          type="text"
          fullWidth
          variant="outlined"
          inputProps={{ maxLength: 150 }}
          value={tripTitle}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTripTitle(e.target.value)}
          sx={{
            marginTop: '16px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          }}
        />
        <Box sx={{ marginTop: '16px' }}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="currency-select-label">
              Select Currencies
            </InputLabel>
            <Select
              labelId="currency-select-label"
              id="currency-select"
              multiple
              value={selectedCurrencies}
              onChange={(e: SelectChangeEvent<string[]>) => {
                // This is a type guard - normally not needed as you'd directly handle in MenuItem click
              }}
              renderValue={(selected: string[]) => selected.join(', ')}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 48 * 4.5 + 8,
                    width: 250,
                  },
                },
              }}
            >
              {currencies.map((currency) => (
                <MenuItem
                  key={currency.label}
                  value={currency.label}
                  onClick={() => handleCurrencyChange(currency.label)}
                >
                  <Checkbox
                    checked={selectedCurrencies.indexOf(currency.label) > -1}
                  />
                  <ListItemText primary={currency.label} />
                </MenuItem>
              ))}
            </Select>
            <Box sx={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
              <span>Minimum: 1 currency</span>
              <br />
              <span>Maximum: 3 currencies</span>
            </Box>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={createTrip}
          disabled={selectedCurrencies.length < 1 || tripTitle.length < 3}
          sx={{
            backgroundColor:
              selectedCurrencies.length < 1 || tripTitle.length < 3
                ? 'grey'
                : '#1976d2',
            color: '#fff',
            '&:hover': { backgroundColor: '#1565c0' },
          }}
        >
          Save Trip
        </Button>
        <Button onClick={resetAndClose} sx={{ color: theme.palette.grey[700] }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
