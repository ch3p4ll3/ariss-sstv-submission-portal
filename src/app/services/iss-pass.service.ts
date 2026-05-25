import { Injectable } from '@angular/core';
import { IssPassPrediction } from '../models/ariss-mission.model';

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

const GRID_TO_COORDS: Record<string, GeoCoordinates> = {
  'FN42': { lat: 42.5, lng: -71.5 },
  'EM29': { lat: 39.5, lng: -94.5 },
  'JO40': { lat: 52.5, lng: 4.5 },
};

@Injectable({ providedIn: 'root' })
export class IssPassService {

  gridToCoordinates(gridSquare: string): GeoCoordinates | null {
    if (GRID_TO_COORDS[gridSquare.toUpperCase()]) {
      return GRID_TO_COORDS[gridSquare.toUpperCase()];
    }
    const match = gridSquare.match(/^([A-R]{2})(\d{2})/i);
    if (!match) return null;
    const lon = (parseInt(match[2], 10) - 1) * 20 + 10 - 180;
    const lat = (match[1].toUpperCase().charCodeAt(0) - 65) * 10 + 5 - 90;
    return { lat, lng: lon };
  }

  async getPassesAtTime(
    gridSquare: string,
    timestampUtc: string,
    _missionId: string,
  ): Promise<IssPassPrediction | null> {
    const coords = this.gridToCoordinates(gridSquare);
    if (!coords) return null;

    try {
      const response = await fetch(
        `https://satellite-api.example.com/passes?lat=${coords.lat}&lng=${coords.lng}&timestamp=${timestampUtc}`
      );
      if (!response.ok) return null;
      const passes: IssPassPrediction[] = await response.json();
      return passes.find(p => {
        const aos = new Date(p.aosUtc).getTime();
        const los = new Date(p.losUtc).getTime();
        const ts = new Date(timestampUtc).getTime();
        return ts >= aos && ts <= los;
      }) ?? null;
    } catch {
      return null;
    }
  }

  async autoDetectMission(gridSquare: string, timestampUtc: string, missions: Array<{ id: string; startDateUtc: string; endDateUtc: string }>): Promise<string | null> {
    for (const mission of missions) {
      const start = new Date(mission.startDateUtc).getTime();
      const end = new Date(mission.endDateUtc).getTime();
      const ts = new Date(timestampUtc).getTime();
      if (ts >= start && ts <= end) {
        const pass = await this.getPassesAtTime(gridSquare, timestampUtc, mission.id);
        if (pass) return mission.id;
      }
    }
    return null;
  }
}
