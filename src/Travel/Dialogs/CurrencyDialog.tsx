import React, { useContext } from 'react';
import { CurrencyContext } from '../../Contexts/CurrencyContext';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useTravel } from '../../Contexts/TravelContext';
import { currencies } from '../Trip';

const CurrencyDialog: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const { state } = useContext(CurrencyContext);
  const travelCtx = useTravel();

  if (state.loading) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Loading Currencies</DialogTitle>
        <DialogContent>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  if (state.error) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Error Fetching Currencies</DialogTitle>
        <DialogContent>{state.error}</DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogContent>
        <List sx={{ width: '100%', maxHeight: '400px', overflowY: 'auto' }}>
          {travelCtx.state.chosenTrip?.currencies?.map(
            (name: string, index: number) => {
              const matchedCurrency = currencies?.find(
                (item) => item.label === name
              );

              if (!matchedCurrency) return null;

              const currencyLabel = matchedCurrency.abr;
              const currencyIcon = matchedCurrency.icon;
              const exchangeRate =
                (1 / state.currencies?.inr[currencyLabel]).toFixed(2) || 'N/A';

              return (
                <ListItem
                  key={index}
                  divider
                  style={{ display: 'flex', justifyContent: 'space-around' }}
                >
                  <ListItemIcon>{currencyIcon}</ListItemIcon>
                  <ListItemText
                    primary={name}
                    primaryTypographyProps={{
                      fontWeight: 'medium',
                      variant: 'h6',
                    }}
                  />
                  <span>{exchangeRate} INR</span>
                </ListItem>
              );
            }
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default CurrencyDialog;
