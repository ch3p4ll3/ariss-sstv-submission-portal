import { Injectable, signal, computed, effect } from '@angular/core';
import { OperatorProfile, OPERATOR_STORAGE_KEY } from '../models/operator-profile.model';

@Injectable({ providedIn: 'root' })
export class OperatorStoreService {
  readonly #profile = signal<OperatorProfile>(this.#load());

  readonly profile = this.#profile.asReadonly();
  readonly hasProfile = computed(() => !!this.#profile().callsign);
  readonly displayName = computed(() => {
    const p = this.#profile();
    return p.callsign ? `${p.callsign} — ${p.name}` : 'Not set';
  });

  constructor() {
    effect(() => {
      const p = this.#profile();
      if (p.callsign) {
        localStorage.setItem(OPERATOR_STORAGE_KEY, JSON.stringify(p));
      }
    });
  }

  save(profile: OperatorProfile): void {
    this.#profile.set({ ...profile });
  }

  update(partial: Partial<OperatorProfile>): void {
    this.#profile.update(p => ({ ...p, ...partial }));
  }

  clear(): void {
    localStorage.removeItem(OPERATOR_STORAGE_KEY);
    this.#profile.set(this.#empty());
  }

  #load(): OperatorProfile {
    try {
      const raw = localStorage.getItem(OPERATOR_STORAGE_KEY);
      if (raw) return JSON.parse(raw) as OperatorProfile;
    } catch { /* ignore corrupt data */ }
    return this.#empty();
  }

  #empty(): OperatorProfile {
    return {
      callsign: '',
      name: '',
      gridSquare: '',
      email: '',
      defaultSstvMode: null,
      defaultSignalReport: null,
    };
  }
}
