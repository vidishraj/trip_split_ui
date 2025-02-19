// TripSelector.tsx
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
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
                                                            refetchTrips
                                                          }) => {
  return (
    <FormControl
      variant="outlined"
      sx={{ marginBottom: '16px', width: '30%', minWidth: '200px' }}
    >
      <InputLabel id="trip-select-label">Choose Trip</InputLabel>
      <Select
        labelId="trip-select-label"
        id="trip-select"
        value={trip}
        onChange={handleTripChange as (event: SelectChangeEvent<string>) => void}
        label="Choose Trip"
        sx={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: isMobile ? '3px' : '5px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
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
