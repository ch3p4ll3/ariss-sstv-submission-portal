import { Component, input, output, signal, computed, effect, inject, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OperatorProfile, CALLSIGN_PATTERN, GRID_SQUARE_PATTERN } from '../../../models/operator-profile.model';
import { SignalReport, UploadFileEntry } from '../../../models/sstv-submission.model';
import { OperatorStoreService } from '../../../services/operator-store.service';
import { UploadService } from '../../../services/upload.service';
import { MissionService } from '../../../services/mission.service';
import { ValidationBadgeComponent } from '../../shared/validation-badge/validation-badge.component';

@Component({
  selector: 'app-station-details',
  standalone: true,
  imports: [FormsModule, ValidationBadgeComponent],
  template: `
    <div class="space-y-6">
      <!-- Operator Profile -->
      <div class="bg-space-800/50 border border-space-700 rounded-lg p-5">
        <h3 class="text-sm font-semibold text-space-200 mb-4 flex items-center gap-2">
          <svg class="w-4 h-4 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          Operator Profile
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-xs text-space-400 mb-1" for="op-callsign">Callsign *</label>
            <input id="op-callsign" [ngModel]="callsign()" (ngModelChange)="callsign.set($event)"
                   class="w-full bg-space-900 border rounded-md px-3 py-2 text-sm text-space-100 cursor-pointer
                          placeholder:text-space-500 focus:outline-none focus:ring-2 focus:ring-neon-cyan/40
                          transition-all"
                   [class.border-red-500/50]="callsignTouched() && !callsignValid()"
                   [class.border-space-600]="!callsignTouched() || callsignValid()"
                   placeholder="AA1XYZ or SWL (if unlicensed)"
                   (blur)="callsignTouched.set(true)">
            @if (callsignTouched() && !callsignValid() && callsign()) {
              <p class="text-[10px] text-red-400 mt-1">Enter a valid callsign or "SWL" if no license</p>
            }
          </div>
          <div>
            <label class="block text-xs text-space-400 mb-1" for="op-name">Operator Name *</label>
            <input id="op-name" [ngModel]="operatorName()" (ngModelChange)="operatorName.set($event)"
                   class="w-full bg-space-900 border border-space-600 rounded-md px-3 py-2 text-sm text-space-100 cursor-pointer
                          placeholder:text-space-500 focus:outline-none focus:ring-2 focus:ring-neon-cyan/40 transition-all"
                   placeholder="Jane Doe">
          </div>
          <div>
            <label class="block text-xs text-space-400 mb-1" for="op-grid">Grid Square *</label>
            <input id="op-grid" [ngModel]="gridSquare()" (ngModelChange)="gridSquare.set($event)"
                   class="w-full bg-space-900 border rounded-md px-3 py-2 text-sm text-space-100 cursor-pointer
                          placeholder:text-space-500 focus:outline-none focus:ring-2 focus:ring-neon-cyan/40
                          transition-all"
                   [class.border-red-500/50]="gridTouched() && !gridValid()"
                   [class.border-space-600]="!gridTouched() || gridValid()"
                   placeholder="FN42"
                   maxlength="6"
                   (blur)="gridTouched.set(true)">
            @if (gridTouched() && !gridValid() && gridSquare()) {
              <p class="text-[10px] text-red-400 mt-1">Invalid grid square (e.g., FN42, JO40)</p>
            }
          </div>
          <div>
            <label class="block text-xs text-space-400 mb-1" for="op-email">Email (for certificate)</label>
            <input id="op-email" [ngModel]="email()" (ngModelChange)="email.set($event)" type="email"
                   class="w-full bg-space-900 border border-space-600 rounded-md px-3 py-2 text-sm text-space-100 cursor-pointer
                          placeholder:text-space-500 focus:outline-none focus:ring-2 focus:ring-neon-cyan/40 transition-all"
                   placeholder="jane@example.com">
          </div>
        </div>

        <label class="flex items-center gap-2 mt-4 text-sm text-space-300 cursor-pointer">
          <input type="checkbox" [ngModel]="saveProfile()" (ngModelChange)="saveProfile.set($event)"
                 class="rounded border-space-600 bg-space-800 text-neon-cyan cursor-pointer focus:ring-neon-cyan/40">
          Save operator profile for future uploads
        </label>
      </div>

      <!-- Per-Image Details -->
      <div class="bg-space-800/50 border border-space-700 rounded-lg p-5">
        <h3 class="text-sm font-semibold text-space-200 mb-4 flex items-center gap-2">
          <svg class="w-4 h-4 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.25a1.444 1.444 0 000 1.5 2.045 2.045 0 003.572 0A1.444 1.444 0 004.5 12.25m0 0a1.444 1.444 0 01-.786-1.284 1.444 1.444 0 012.86-.572 1.444 1.444 0 01-2.074 1.856zM2.25 6.75h1.5m-1.5 3h1.5m6.75-6h5.25a2.25 2.25 0 012.25 2.25v8.25a2.25 2.25 0 01-2.25 2.25h-5.25M9.75 3.75h-1.5m1.5 3h-1.5m1.5 3h-1.5m3 6h5.25M15.75 21h-5.25a2.25 2.25 0 01-2.25-2.25V5.25A2.25 2.25 0 0110.5 3h5.25a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0115.75 21z" />
          </svg>
          Image Timestamps & Campaigns
        </h3>

        <div class="space-y-2">
          @for (entry of uploadService.files(); track entry.id) {
            <div class="grid grid-cols-[auto_1fr] sm:flex sm:items-center gap-2 sm:gap-3 bg-space-900/50 rounded-lg p-2.5 border border-space-700/50">
              <!-- Thumbnail + filename row (mobile: spans full width) -->
              <button (click)="openPreview(entry.localPreviewUrl)"
                      class="row-span-2 sm:flex-shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-neon-cyan/40 rounded">
                <img [src]="entry.localPreviewUrl"
                     [alt]="entry.file.name"
                     class="w-10 h-8 object-cover rounded border border-space-600 hover:border-neon-cyan/50 transition-colors">
              </button>

              <span class="text-xs text-space-300 truncate self-center sm:min-w-0 sm:w-32 sm:flex-shrink-0" [title]="entry.file.name">
                {{ entry.file.name }}
              </span>

              <!-- UTC Timestamp -->
              <div class="col-span-2 sm:flex-1 sm:min-w-0">
                <label class="block text-[9px] text-space-500 uppercase tracking-wider mb-0.5">UTC Timestamp</label>
                <input [ngModel]="getDatetimeLocal(entry.id)" (ngModelChange)="setDatetimeLocal(entry.id, $event)"
                       type="datetime-local"
                       class="w-full bg-space-950 border border-space-600 rounded px-2 py-1 text-xs text-space-100 font-mono cursor-pointer
                              focus:outline-none focus:ring-1 focus:ring-neon-cyan/40
                              [color-scheme:dark]">
              </div>

              <!-- Campaign + validation row -->
              <div class="col-span-2 sm:w-44 sm:flex-shrink-0">
                <label class="block text-[9px] text-space-500 uppercase tracking-wider mb-0.5">SSTV Campaign</label>
                <select [ngModel]="getMission(entry.id)" (ngModelChange)="setMission(entry.id, $event)"
                        class="w-full bg-space-950 border border-space-600 rounded px-2 py-1 text-xs text-space-200 cursor-pointer
                               focus:outline-none focus:ring-1 focus:ring-neon-cyan/40">
                  <option value="">Auto-detect</option>
                  @for (m of missionService.missions(); track m.id) {
                    <option [value]="m.id">{{ m.name }}</option>
                  }
                </select>
              </div>

              <!-- Validation -->
              <div class="col-span-2 sm:w-36 sm:flex-shrink-0">
                @if (entry.missionId && entry.captureTimestampUtc) {
                  <app-validation-badge [level]="getValidationLevel(entry.id)"
                                        [message]="getValidationMessage(entry.id)" />
                } @else if (entry.captureTimestampUtc) {
                  <app-validation-badge level="info" message="Select a campaign" />
                } @else {
                  <app-validation-badge level="warning" message="No timestamp" />
                }
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Signal Report -->
      <div class="bg-space-800/50 border border-space-700 rounded-lg p-5">
        <h3 class="text-sm font-semibold text-space-200 mb-4 flex items-center gap-2">
          <svg class="w-4 h-4 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
          </svg>
          Signal Quality Report (RST)
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label class="block text-xs text-space-400 mb-1">RST (Readability)</label>
            <select [ngModel]="rstReadability()" (ngModelChange)="rstReadability.set($event)"
                    class="w-full bg-space-900 border border-space-600 rounded-md px-3 py-2 text-sm text-space-100 cursor-pointer
                           focus:outline-none focus:ring-2 focus:ring-neon-cyan/40 transition-all">
              @for (v of [1,2,3,4,5]; track v) {
                <option [value]="v">{{ ['','Unreadable','Barely readable','Readable with difficulty','Readable','Perfectly readable'][v] }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block text-xs text-space-400 mb-1">QRN (Static)</label>
            <select [ngModel]="qrn()" (ngModelChange)="qrn.set($event)"
                    class="w-full bg-space-900 border border-space-600 rounded-md px-3 py-2 text-sm text-space-100 cursor-pointer
                           focus:outline-none focus:ring-2 focus:ring-neon-cyan/40 transition-all">
              @for (v of [1,2,3,4,5]; track v) {
                <option [value]="v">{{ ['','Low','Moderate','High','Severe'][v - 1] }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block text-xs text-space-400 mb-1">QRM (Interference)</label>
            <select [ngModel]="qrm()" (ngModelChange)="qrm.set($event)"
                    class="w-full bg-space-900 border border-space-600 rounded-md px-3 py-2 text-sm text-space-100 cursor-pointer
                           focus:outline-none focus:ring-2 focus:ring-neon-cyan/40 transition-all">
              @for (v of [1,2,3,4,5]; track v) {
                <option [value]="v">{{ ['','Low','Moderate','High','Severe'][v - 1] }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block text-xs text-space-400 mb-1">QSB (Fading)</label>
            <select [ngModel]="qsb()" (ngModelChange)="qsb.set($event)"
                    class="w-full bg-space-900 border border-space-600 rounded-md px-3 py-2 text-sm text-space-100 cursor-pointer
                           focus:outline-none focus:ring-2 focus:ring-neon-cyan/40 transition-all">
              @for (v of [1,2,3,4,5]; track v) {
                <option [value]="v">{{ ['','Low','Moderate','High','Severe'][v - 1] }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex justify-between pt-2">
        <button (click)="back.emit()"
                class="px-4 py-2 text-sm text-space-300 hover:text-space-100 border border-space-600 rounded-md cursor-pointer
                       hover:border-space-400 transition-all">
          Back
        </button>
        <button (click)="onProceed()"
                [disabled]="!isValid()"
                class="px-6 py-2 text-sm font-semibold rounded-md transition-all cursor-pointer
                       bg-neon-cyan text-space-950 hover:bg-neon-cyan/90
                       disabled:opacity-30 disabled:cursor-not-allowed">
          Review & Submit
        </button>
      </div>
    </div>

    <!-- Image preview lightbox -->
    @if (previewUrl(); as url) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-cosmic-950/90 backdrop-blur-sm p-4"
           (click)="closePreview()"
           (keydown.escape)="closePreview()"
           role="dialog"
           aria-modal="true"
           aria-label="Image preview">
        <div class="relative max-w-3xl max-h-[90vh]"
             (click)="$event.stopPropagation()">
          <img [src]="url"
               alt="Preview"
               class="max-w-full max-h-[85vh] object-contain rounded-lg border border-space-700 shadow-2xl">
          <button (click)="closePreview()"
                  class="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-space-800 border border-space-600
                         text-space-300 hover:text-white flex items-center justify-center cursor-pointer
                         transition-all shadow-lg"
                  aria-label="Close preview">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    }
  `,
})
export class StationDetailsComponent {
  readonly back = output<void>();
  readonly proceed = output<OperatorProfile>();

  readonly uploadService = inject(UploadService);
  readonly missionService = inject(MissionService);

  readonly previewUrl = signal<string | null>(null);

  readonly callsign = signal('');
  readonly operatorName = signal('');
  readonly gridSquare = signal('');
  readonly email = signal('');
  readonly saveProfile = signal(false);

  readonly callsignTouched = signal(false);
  readonly gridTouched = signal(false);

  readonly rstReadability = signal(0);
  readonly qrn = signal(1);
  readonly qrm = signal(1);
  readonly qsb = signal(1);

  readonly callsignValid = signal(false);
  readonly gridValid = signal(false);
  readonly isValid = signal(false);

  readonly signalReport = signal<SignalReport>({ rst: 0, qrm: 1, qrn: 1, qsb: 1 });

  constructor(private operatorStore: OperatorStoreService) {
    effect(() => {
      this.callsignValid.set(CALLSIGN_PATTERN.test(this.callsign()));
      this.gridValid.set(GRID_SQUARE_PATTERN.test(this.gridSquare()));
    });
    effect(() => {
      this.isValid.set(!!(this.callsignValid() && this.gridValid() && this.operatorName()));
    });
    effect(() => {
      this.signalReport.set({
        rst: this.rstReadability(),
        qrm: this.qrm(),
        qrn: this.qrn(),
        qsb: this.qsb(),
      });
    });
  }

  ngOnInit(): void {
    const files = this.uploadService.files();
    const first = files.find(f => f.callsign || f.operatorName || f.gridSquare);

    if (first) {
      this.callsign.set(first.callsign);
      this.operatorName.set(first.operatorName);
      this.gridSquare.set(first.gridSquare);
    }

    for (const entry of files) {
      if (entry.captureTimestampUtc && !entry.missionId) {
        const suggested = this.missionService.suggestMission(entry.captureTimestampUtc);
        if (suggested) {
          this.uploadService.updateFile(entry.id, { missionId: suggested });
        }
      }
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closePreview();
  }

  openPreview(url: string): void {
    this.previewUrl.set(url);
  }

  closePreview(): void {
    this.previewUrl.set(null);
  }

  getDatetimeLocal(id: string): string {
    const ts = this.uploadService.files().find(f => f.id === id)?.captureTimestampUtc;
    if (!ts) return '';
    return ts.slice(0, 16);
  }

  setDatetimeLocal(id: string, value: string): void {
    if (!value) {
      this.uploadService.updateFile(id, { captureTimestampUtc: null });
      return;
    }
    this.uploadService.updateFile(id, { captureTimestampUtc: value + ':00Z' });
  }

  getMission(id: string): string {
    return this.uploadService.files().find(f => f.id === id)?.missionId ?? '';
  }

  setMission(id: string, value: string): void {
    this.uploadService.updateFile(id, { missionId: value || null });
  }

  getValidationLevel(id: string): 'success' | 'warning' | 'error' {
    const entry = this.uploadService.files().find(f => f.id === id);
    if (!entry?.captureTimestampUtc || !entry?.missionId) return 'warning';
    const result = this.missionService.validateTimestampForMission(entry.captureTimestampUtc, entry.missionId);
    return result.valid ? 'success' : 'error';
  }

  getValidationMessage(id: string): string {
    const entry = this.uploadService.files().find(f => f.id === id);
    if (!entry?.captureTimestampUtc) return 'No timestamp set';
    if (!entry?.missionId) return 'No campaign selected';
    const result = this.missionService.validateTimestampForMission(entry.captureTimestampUtc, entry.missionId);
    return result.message;
  }

  onProceed(): void {
    const sr = this.signalReport();
    const profile: OperatorProfile = {
      callsign: this.callsign().toUpperCase(),
      name: this.operatorName(),
      gridSquare: this.gridSquare().toUpperCase(),
      email: this.email(),
      defaultSstvMode: null,
      defaultSignalReport: sr,
    };

    if (this.saveProfile()) {
      this.operatorStore.save(profile);
    }

    this.proceed.emit(profile);
  }
}
