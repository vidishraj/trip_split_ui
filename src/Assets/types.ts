// types/trip.ts
import { TripResponse } from '../Contexts/TravelContext';

export interface TripData {
  tripIdShared: string;
  tripTitle: string;
  currencies: string[];
  [key: string]: any; // For any additional properties
}

export interface Currency {
  label: string;
  abr: string;
  icon: JSX.Element;
}

// types/context.ts
export interface TravelContextState {
  trip: TripResponse[] | undefined;
  chosenTrip: TripResponse | undefined;
  [key: string]: any;
}

export interface TravelContextType {
  state: TravelContextState;
  dispatch: React.Dispatch<TravelAction>;
}

export interface TravelAction {
  type: string;
  payload: any;
}

export interface MessagePayload {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface MessageContextType {
  setPayload: (payload: MessagePayload) => void;
}
