import { SignalReport } from './sstv-submission.model';

export interface OperatorProfile {
  callsign: string;
  name: string;
  gridSquare: string;
  email: string;
  defaultSstvMode: string | null;
  defaultSignalReport: SignalReport | null;
}

export const OPERATOR_STORAGE_KEY = 'ariss-operator-profile';

export const GRID_SQUARE_PATTERN = /^[A-R]{2}[0-9]{2}[A-X]{0,2}$/i;
export const CALLSIGN_PATTERN = /^(?:[A-Z0-9]{1,2}[0-9][A-Z0-9]{1,3}|SWL)$/i;
