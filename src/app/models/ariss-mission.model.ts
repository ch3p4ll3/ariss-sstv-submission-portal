export interface ArissMission {
  id: string;
  name: string;
  description: string;
  startDateUtc: string;
  endDateUtc: string;
  sstvMode: string;
  frequencyMhz: number;
  isActive: boolean;
}

export interface IssPassPrediction {
  missionId: string;
  gridSquare: string;
  aosUtc: string;
  losUtc: string;
  maxElevation: number;
  durationSeconds: number;
}
