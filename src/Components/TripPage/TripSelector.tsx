// TripSelector.tsx
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { TripMenuItem } from './TripMenuItem';
import { TripData } from '../../Assets/types';

interface TripSelectorProps {
  trip: string;
  handleTripChange: (event: React.ChangeEvent<{ value: unknown }>) => void;
  trips?: TripData[];
  travelCtx: any;
  isMobile: boolean;
  handleEditTrip: (item: TripData) => void;
  refetchTrips: () => void;
}

export const TripSelector: React.FC<TripSelectorProps> = ({
  trip,
  handleTripChange,
  trips = [],
  travelCtx,
  isMobile,
  handleEditTrip,
  refetchTrips,
}) => {
  return (
    <FormControl
      variant="outlined"
      sx={{ 
        marginBottom: '20px', 
        width: '60%', 
        minWidth: '280px',
        maxWidth: '400px'
      }}
    >
      <InputLabel 
        id="trip-select-label"
        sx={{
          color: '#1976d2',
          fontWeight: '600',
          '&.Mui-focused': {
            color: '#1976d2',
          }
        }}
      >
        Choose Trip
      </InputLabel>
      <Select
        labelId="trip-select-label"
        id="trip-select"
        value={trip}
        onChange={
          handleTripChange as (event: SelectChangeEvent<string>) => void
        }
        label="Choose Trip"
        sx={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          fontSize: isMobile ? '14px' : '16px',
          fontWeight: '500',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1976d2',
            borderWidth: '2px',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1565c0',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1976d2',
          },
          '& .MuiSelect-select': {
            padding: isMobile ? '12px 14px' : '16px 14px',
          }
        }}
      >
        {trips.map((item) => (
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
            <TripMenuItem
              item={item}
              handleEditTrip={handleEditTrip}
              refetchTrips={refetchTrips}
            />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
