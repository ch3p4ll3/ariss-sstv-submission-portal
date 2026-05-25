import { Injectable, signal } from '@angular/core';
import { ArissMission } from '../models/ariss-mission.model';

const HARDCODED_MISSIONS: ArissMission[] = [
  {
    id: 'ariss-2025-1',
    name: 'ARISS SSTV 2025-1',
    description: 'First SSTV event of 2025',
    startDateUtc: '2025-02-01T00:00:00Z',
    endDateUtc: '2025-02-07T23:59:59Z',
    sstvMode: 'PD120',
    frequencyMhz: 145.800,
    isActive: false,
  },
  {
    id: 'ariss-2025-2',
    name: 'ARISS SSTV 2025-2',
    description: 'Second SSTV event of 2025',
    startDateUtc: '2025-04-15T00:00:00Z',
    endDateUtc: '2025-04-21T23:59:59Z',
    sstvMode: 'PD120',
    frequencyMhz: 145.800,
    isActive: false,
  },
  {
    id: 'ariss-2026-1',
    name: 'ARISS SSTV 2026-1',
    description: 'First SSTV event of 2026',
    startDateUtc: '2026-01-28T00:00:00Z',
    endDateUtc: '2026-02-03T23:59:59Z',
    sstvMode: 'PD120',
    frequencyMhz: 145.800,
    isActive: true,
  },
  {
    id: 'ariss-2026-2',
    name: 'ARISS SSTV 2026-2',
    description: 'Second SSTV event of 2026',
    startDateUtc: '2026-04-14T00:00:00Z',
    endDateUtc: '2026-04-20T23:59:59Z',
    sstvMode: 'PD120',
    frequencyMhz: 145.800,
    isActive: false,
  },
];

export interface TimestampValidation {
  valid: boolean;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class MissionService {
  readonly #missions = signal<ArissMission[]>(HARDCODED_MISSIONS);
  readonly missions = this.#missions.asReadonly();
  readonly activeMission = signal(HARDCODED_MISSIONS.find(m => m.isActive) ?? null);

  validateTimestampForMission(timestampUtc: string, missionId: string): TimestampValidation {
    const mission = this.#missions().find(m => m.id === missionId);
    if (!mission) return { valid: false, message: 'Unknown campaign' };

    const ts = new Date(timestampUtc).getTime();
    const start = new Date(mission.startDateUtc).getTime();
    const end = new Date(mission.endDateUtc).getTime();

    if (isNaN(ts)) return { valid: false, message: 'Invalid timestamp format' };

    if (ts < start) return { valid: false, message: `Before ${mission.name} started (${mission.startDateUtc.slice(0, 10)})` };
    if (ts > end) return { valid: false, message: `After ${mission.name} ended (${mission.endDateUtc.slice(0, 10)})` };
    return { valid: true, message: 'Timestamp matches campaign window' };
  }

  suggestMission(timestampUtc: string): string | null {
    const ts = new Date(timestampUtc).getTime();
    if (isNaN(ts)) return null;

    for (const mission of this.#missions()) {
      const start = new Date(mission.startDateUtc).getTime();
      const end = new Date(mission.endDateUtc).getTime();
      if (ts >= start && ts <= end) return mission.id;
    }
    return null;
  }
}
