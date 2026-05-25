import { Component, output, signal, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GalleryFilterCriteria, GallerySortField } from '../../../models/gallery-filter.model';
import { SstvMode } from '../../../models/sstv-submission.model';

@Component({
  selector: 'app-gallery-filter-bar',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="bg-space-800/50 border border-space-700 rounded-lg p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-space-200 flex items-center gap-2">
          <svg class="w-4 h-4 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
          </svg>
          Filters
        </h3>
        <button (click)="clearFilters()" class="cursor-pointer text-xs text-space-400 hover:text-space-200 underline underline-offset-2 transition-colors">
          Clear all
        </button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div>
          <label class="block text-[10px] text-space-400 uppercase tracking-wider mb-1" for="filter-callsign">Callsign</label>
          <input id="filter-callsign" [(ngModel)]="callsign"
                 class="w-full bg-space-900 border border-space-600 rounded px-2 py-1.5 text-sm text-space-100
                        placeholder:text-space-500 focus:outline-none focus:ring-2 focus:ring-neon-cyan/40 transition-all"
                 placeholder="AA1XYZ"
                 (input)="emitFilter()">
        </div>
        <div>
          <label class="block text-[10px] text-space-400 uppercase tracking-wider mb-1" for="filter-grid">Grid</label>
          <input id="filter-grid" [(ngModel)]="gridSquare"
                 class="w-full bg-space-900 border border-space-600 rounded px-2 py-1.5 text-sm text-space-100
                        placeholder:text-space-500 focus:outline-none focus:ring-2 focus:ring-neon-cyan/40 transition-all"
                 placeholder="FN42"
                 (input)="emitFilter()">
        </div>
        <div>
          <label class="block text-[10px] text-space-400 uppercase tracking-wider mb-1" for="filter-mission">Mission</label>
          <select id="filter-mission" [(ngModel)]="missionId" (change)="emitFilter()"
                  class="w-full bg-space-900 border border-space-600 rounded px-2 py-1.5 text-sm text-space-100
                         focus:outline-none focus:ring-2 focus:ring-neon-cyan/40 transition-all">
            <option value="">All Missions</option>
            <option value="ariss-2025-1">ARISS SSTV 2025-1</option>
            <option value="ariss-2025-2">ARISS SSTV 2025-2</option>
            <option value="ariss-2024-3">ARISS SSTV 2024-3</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] text-space-400 uppercase tracking-wider mb-1" for="filter-mode">SSTV Mode</label>
          <select id="filter-mode" [(ngModel)]="sstvMode" (change)="emitFilter()"
                  class="w-full bg-space-900 border border-space-600 rounded px-2 py-1.5 text-sm text-space-100
                         focus:outline-none focus:ring-2 focus:ring-neon-cyan/40 transition-all">
            <option value="">All Modes</option>
            @for (mode of modes; track mode) {
              <option [value]="mode">{{ mode }}</option>
            }
          </select>
        </div>
        <div>
          <label class="block text-[10px] text-space-400 uppercase tracking-wider mb-1" for="filter-date-from">From</label>
          <input id="filter-date-from" [(ngModel)]="dateFrom" type="date"
                 class="w-full bg-space-900 border border-space-600 rounded px-2 py-1.5 text-sm text-space-100
                        focus:outline-none focus:ring-2 focus:ring-neon-cyan/40 transition-all"
                 (change)="emitFilter()">
        </div>
        <div>
          <label class="block text-[10px] text-space-400 uppercase tracking-wider mb-1" for="filter-date-to">To</label>
          <input id="filter-date-to" [(ngModel)]="dateTo" type="date"
                 class="w-full bg-space-900 border border-space-600 rounded px-2 py-1.5 text-sm text-space-100
                        focus:outline-none focus:ring-2 focus:ring-neon-cyan/40 transition-all"
                 (change)="emitFilter()">
        </div>
      </div>

      <!-- Sort row -->
      <div class="flex items-center gap-3 mt-3 pt-3 border-t border-space-700/50">
        <label class="text-[10px] text-space-400 uppercase tracking-wider" for="filter-sort">Sort by</label>
        <select id="filter-sort" [(ngModel)]="sortBy" (change)="emitFilter()"
                class="bg-space-900 border border-space-600 rounded px-2 py-1 text-xs text-space-200
                       focus:outline-none focus:ring-2 focus:ring-neon-cyan/40 transition-all">
          <option value="captureTimestampUtc">Date Captured</option>
          <option value="uploadedAt">Date Uploaded</option>
          <option value="voteCount">Votes</option>
          <option value="callsign">Callsign</option>
        </select>
        <button (click)="toggleDirection()"
                class="cursor-pointer p-1 rounded hover:bg-space-700 transition-colors"
                [attr.aria-label]="sortDirection() === 'desc' ? 'Sort descending' : 'Sort ascending'">
          @if (sortDirection() === 'desc') {
            <svg class="w-4 h-4 text-space-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" />
            </svg>
          } @else {
            <svg class="w-4 h-4 text-space-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25" />
            </svg>
          }
        </button>
        <span class="text-xs text-space-500 ml-auto">{{ totalCount() }} result{{ totalCount() !== 1 ? 's' : '' }}</span>
      </div>
    </div>
  `,
})
export class GalleryFilterBarComponent {
  readonly filterChange = output<Partial<GalleryFilterCriteria>>();
  readonly totalCount = input(0);

  readonly modes: SstvMode[] = ['Scottie 1', 'Scottie 2', 'Martin 1', 'Martin 2', 'Robot 36', 'Robot 72', 'PD120', 'PD180', 'PD290'];

  readonly callsign = signal('');
  readonly gridSquare = signal('');
  readonly missionId = signal('');
  readonly sstvMode = signal('');
  readonly dateFrom = signal('');
  readonly dateTo = signal('');
  readonly sortBy = signal<GallerySortField>('captureTimestampUtc');
  readonly sortDirection = signal<'asc' | 'desc'>('desc');

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  emitFilter(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.filterChange.emit({
        callsign: this.callsign(),
        gridSquare: this.gridSquare(),
        missionId: this.missionId(),
        sstvMode: this.sstvMode() as SstvMode | '',
        dateFrom: this.dateFrom(),
        dateTo: this.dateTo(),
        sortBy: this.sortBy(),
        sortDirection: this.sortDirection(),
      });
    }, 300);
  }

  toggleDirection(): void {
    this.sortDirection.update(d => d === 'desc' ? 'asc' : 'desc');
    this.emitFilter();
  }

  clearFilters(): void {
    this.callsign.set('');
    this.gridSquare.set('');
    this.missionId.set('');
    this.sstvMode.set('');
    this.dateFrom.set('');
    this.dateTo.set('');
    this.sortBy.set('captureTimestampUtc');
    this.sortDirection.set('desc');
    this.emitFilter();
  }
}
