import React, { useState } from 'react';
import {
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Checkbox,
  ListItemText,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useTheme, useMediaQuery } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useTravel } from '../Contexts/TravelContext';
import { useMessage } from '../Contexts/NotifContext';
import { fetchTrips, insertTrip, sendTripRequest } from '../Api';
import Lottie from 'lottie-react';
import animationData from './tripAnimation.json';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EuroIcon from '@mui/icons-material/Euro';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CurrencyPoundIcon from '@mui/icons-material/CurrencyPound';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';

export const currencies = [
  { label: 'US Dollar', abr: 'usd', icon: <AttachMoneyIcon /> },
  { label: 'Indian Rupees', abr: 'inr', icon: <CurrencyRupeeIcon /> },
  { label: 'Euros', abr: 'eur', icon: <EuroIcon /> },
  { label: 'British Pound', abr: 'gbp', icon: <CurrencyPoundIcon /> },
  { label: 'Australian Dollar', abr: 'aud', icon: <CurrencyExchangeIcon /> },
  { label: 'Thai Baht', abr: 'thb', icon: <FormatBoldIcon /> },
];

const TripPage = () => {
  const [trip, setTrip] = useState('');
  const [open, setOpen] = useState(false);
  const [openTripConnector, setTripConnector] = useState(false);
  const [tripTitle, setTripTitle] = useState('');
  const [tripIdConnect, setTripIdConnect] = useState('');
  const notif = useMessage();
  const travelCtx = useTravel();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);

  const handleCurrencyChange = (currency: string) => {
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

  function createTrip() {
    insertTrip({
      trip: tripTitle,
      currencies: selectedCurrencies,
    })
      .then((response: AxiosResponse) => {
        if (response.status === 200) {
          notif.setPayload({
            type: 'success',
            message: 'Successfully created trip.',
          });
        }
        setOpen(false);
        fetchTrips(true)
          .then((response) => {
            if (Array.isArray(response.data.Message)) {
              response.data.Message.forEach((item: any) => {
                item['currencies'] = item['currencies'].toString().split(',');
              });
              travelCtx.dispatch({
                type: 'SET_TRIP',
                payload: response.data.Message,
              });
            }
          })
          .catch((error) => {
            notif.setPayload({
              type: 'error',
              message: 'Error fetching trip.',
            });
          });
      })
      .catch((error) => {
        notif.setPayload({
          type: 'error',
          message: 'Error creating trip.',
        });
        setOpen(false);
        console.log(error);
      });
  }

  function sendTripConnectRequest() {
    if (tripIdConnect.length !== 6) {
      notif.setPayload({
        type: 'error',
        message: 'Trip Id should be 6 characters long',
      });
      return;
    }
    sendTripRequest(tripIdConnect)
      .then((response) => {
        console.log(response);
        notif.setPayload({
          type: 'success',
          message: 'Request sent successfully. Ask your friend to add you!',
        });
      })
      .catch((error) => {
        notif.setPayload({
          type: 'error',
          message: 'Error occurred while sending request',
        });
      });

    setTripConnector(false);
  }
  const handleTripChange = (event: any) => {
    setTrip(event.target.value);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      position="relative"
      sx={{
        overflow: 'hidden',
      }}
    >
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        zIndex={-1}
        display={isMobile ? 'flex' : 'relative'}
        alignItems={isMobile ? 'center' : ''}
        justifyContent={isMobile ? 'center' : ''}
        sx={{
          opacity: 0.6,
        }}
      >
        <Lottie
          loop={true}
          autoplay={true}
          animationData={animationData}
          rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}
          height={isMobile ? 300 : 500}
          width={isMobile ? 300 : 500}
        />
      </Box>
      <Box
        width="100%"
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'center'}
        alignItems={'center'}
      >
        <FormControl
          variant="outlined"
          sx={{ marginBottom: '16px', width: '30%', minWidth: '200px' }}
        >
          <InputLabel id="trip-select-label">Choose Trip</InputLabel>
          <Select
            labelId="trip-select-label"
            id="trip-select"
            value={trip}
            onChange={handleTripChange}
            label="Choose Trip"
            sx={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: isMobile ? '3px' : '5px',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
            }}
          >
            {travelCtx?.state?.trip?.map((item) => {
              return (
                <MenuItem
                  key={item.tripIdShared}
                  onClick={() => {
                    travelCtx.dispatch({
                      type: 'SET_CHOSEN_TRIP',
                      payload: item,
                    });
                  }}
                  value={item.tripIdShared}
                >
                  {item.tripTitle}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <Box
          display="flex"
          justifyContent={'space-around'}
          width="50%"
          minWidth={'300px'}
        >
          <Button
            variant="contained"
            onClick={handleClickOpen}
            startIcon={<Add />}
            sx={{
              padding: isMobile ? '5px' : '16px',
              fontSize: isMobile ? '12px' : '16px',
              backgroundColor: '#1976d2',
              color: '#fff',
              borderRadius: '12px',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
              '&:hover': {
                backgroundColor: '#1565c0',
              },
            }}
          >
            Create Trip
          </Button>

          <Button
            variant="contained"
            onClick={() => setTripConnector(true)}
            startIcon={<ConnectWithoutContactIcon />}
            sx={{
              padding: isMobile ? '5px' : '16px',
              fontSize: isMobile ? '12px' : '16px',
              backgroundColor: '#1976d2',
              color: '#fff',
              borderRadius: '12px',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
              '&:hover': {
                backgroundColor: '#1565c0',
              },
            }}
          >
            Connect Trip
          </Button>
        </Box>
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
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
              onChange={(e) => setTripTitle(e.target.value)}
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
                  renderValue={(selected) => selected.join(', ')}
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
                      onClick={(e) => {
                        handleCurrencyChange(currency.label);
                      }}
                    >
                      <Checkbox
                        checked={
                          selectedCurrencies.indexOf(currency.label) > -1
                        }
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
            <Button
              onClick={handleClose}
              sx={{ color: theme.palette.grey[700] }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={openTripConnector}
          onClose={() => setTripConnector(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Connect Trip</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="trip-title"
              label="Trip ID"
              type="text"
              fullWidth
              variant="outlined"
              slotProps={{ htmlInput: { maxLength: 6, minLength: 6 } }}
              value={tripIdConnect}
              onChange={(e) => setTripIdConnect(e.target.value)}
              sx={{
                marginTop: '16px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={sendTripConnectRequest}
              disabled={tripIdConnect.length !== 6}
              sx={{
                backgroundColor:
                  tripIdConnect.length !== 6 ? 'grey' : '#1976d2',
                color: '#fff',
                '&:hover': { backgroundColor: '#1565c0' },
              }}
            >
              Send Request
            </Button>
            <Button
              onClick={() => setTripConnector(false)}
              sx={{ color: theme.palette.grey[700] }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default TripPage;
