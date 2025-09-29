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
  Theme,
  Typography,
  IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material';
import { useMessage } from '../../Contexts/NotifContext';
import { insertTrip } from '../../Api/Api';
import { currencies } from '../../Assets/currencyData';
import { MessageContextType } from '../../Assets/types';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import SaveIcon from '@mui/icons-material/Save';

interface CreateTripDialogProps {
  open: boolean;
  handleClose: () => void;
  refetchTrips: () => void;
}

export const CreateTripDialog: React.FC<CreateTripDialogProps> = ({
  open,
  handleClose,
  refetchTrips,
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
      });
  };

  const resetAndClose = (): void => {
    setTripTitle('');
    setSelectedCurrencies([]);
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={resetAndClose}
      fullWidth
      maxWidth="sm"
      sx={{
        '& .MuiPaper-root': {
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          padding: '16px',
        },
      }}
    >
      {/* Title with an Icon */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 'bold',
        }}
      >
        <FlightTakeoffIcon color="primary" /> Create New Trip
      </DialogTitle>

      <DialogContent>
        {/* Trip Title Input */}
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTripTitle(e.target.value)
          }
          sx={{
            marginTop: '16px',
            backgroundColor: '#F9FAFB',
            borderRadius: '8px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          }}
          InputProps={{
            startAdornment: <AddCircleOutlineIcon color="action" />,
          }}
        />

        {/* Currency Selection */}
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
              renderValue={(selected: string[]) => selected.join(', ')}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 48 * 4.5 + 8,
                    width: 250,
                  },
                },
              }}
              sx={{
                backgroundColor: '#F9FAFB',
                borderRadius: '8px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
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
          </FormControl>

          {/* Currency Limits */}
          <Typography
            variant="body2"
            sx={{ marginTop: '8px', fontSize: '12px', color: '#666' }}
          >
            Minimum: 1 currency | Maximum: 3 currencies
          </Typography>
        </Box>
      </DialogContent>

      {/* Actions: Save & Cancel */}
      <DialogActions sx={{ justifyContent: 'space-between', padding: '16px', gap: 2 }}>
        <Button
          onClick={createTrip}
          variant="contained"
          disabled={selectedCurrencies.length < 1 || tripTitle.length < 3}
          startIcon={<SaveIcon />}
          sx={{
            backgroundColor:
              selectedCurrencies.length < 1 || tripTitle.length < 3
                ? '#ccc'
                : '#1976d2',
            color: '#fff',
            borderRadius: '8px',
            padding: '10px 20px',
            fontWeight: '600',
            '&:hover': {
              backgroundColor:
                selectedCurrencies.length < 1 || tripTitle.length < 3
                  ? '#ccc'
                  : '#1565c0',
            },
          }}
        >
          Save Trip
        </Button>

        <Button 
          onClick={resetAndClose} 
          variant="outlined"
          color="error"
          sx={{
            borderRadius: '8px',
            padding: '10px 20px',
            fontWeight: '600',
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
