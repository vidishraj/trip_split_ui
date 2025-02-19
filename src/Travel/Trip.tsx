import React, { useEffect, useState } from 'react';
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
import { deleteTrip, fetchTrips, insertTrip, sendTripRequest, updateTripTitle } from '../Api';
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
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [editData, setEditData] = useState<any>(undefined);

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

  function deleteTripWithId(tripId:string) {
    deleteTrip(true, tripId).then((response: AxiosResponse) => {
      if(response.status===200 ){
        notif.setPayload({type: 'success',
          message: 'Trip deleted successfully.'});

      }
    }).catch((error) => {
    if(error.status === 401) {
      notif.setPayload({type: 'error', message: `Expenses exist for the trip`});
    }
    else{
        notif.setPayload({type: 'error', message: 'Error deleting trip.'});
      }
    })
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
            {travelCtx?.state?.trip?.map((item) => (
              <MenuItem
                key={item.tripIdShared}
                onClick={() => {
                  travelCtx.dispatch({
                    type: 'SET_CHOSEN_TRIP',
                    payload: item,
                  });
                }}
                value={item.tripIdShared}
                // sx={{ width:'100%',}}
              >
                <div style={{display:'flex',justifyContent: 'space-between', alignItems: 'center', width:'100%'}}>

                  <span>{item.tripTitle}</span>
                  <div>
                <Button
                  variant="outlined"
                  size="small"
                  color={'error'}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTripWithId(item.tripIdShared)
                  }}
                  sx={{
                    // marginLeft: '8px',
                    borderColor: theme.palette.error.light,
                    '&:hover': {
                      backgroundColor: theme.palette.error.light,
                    },
                  }}
                >
                  Delete
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditData(item); // Assuming `editData` will hold the current trip details
                    setOpenEditDialog(true);
                  }}
                  sx={{
                    marginLeft: '8px',
                    color: theme.palette.primary.main,
                    borderColor: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.light,
                    },
                  }}
                >
                  Edit
                </Button>
                </div>
                </div>
              </MenuItem>
            ))}
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
        <EditDialog editData={editData} openEditDialog={openEditDialog} setOpenEditDialog={setOpenEditDialog}/>
      </Box>
    </Box>
  );
};

const EditDialog=({editData, openEditDialog, setOpenEditDialog}:{editData:any, openEditDialog:any, setOpenEditDialog:any})=>{
  const [editedTripTitle, setEditedTripTitle] = useState('');
  const travelCtx = useTravel();
  const notif = useMessage()
  useEffect(() => {
    if(editData && editedTripTitle===''){
      setEditedTripTitle(editData.tripTitle)
    }
  },[editData, editedTripTitle])
  const handleEditSave = () => {
    updateTripTitle(editedTripTitle, editData.tripIdShared).then((body) => {
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

    }).catch((error) => {
      notif.setPayload({
        type: 'error',
        message: 'Error editing trip title.',
      });
    });
    setOpenEditDialog(false);
  };

  return (
    <>
      {/* Existing Dialogs */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        fullWidth
        maxWidth="sm"
      >
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
            onChange={(e) => setEditedTripTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleEditSave}
            disabled={editData?editedTripTitle===editData.tripTitle:true}
          >
            Save Changes
          </Button>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
export default TripPage;
