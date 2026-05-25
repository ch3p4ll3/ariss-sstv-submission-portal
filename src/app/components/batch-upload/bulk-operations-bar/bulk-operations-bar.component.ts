import { Component, output, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OperatorStoreService } from '../../../services/operator-store.service';

@Component({
  selector: 'app-bulk-operations-bar',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="bg-space-800/80 border border-space-700 rounded-lg p-4 backdrop-blur-sm">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-space-200 flex items-center gap-2">
          <svg class="w-4 h-4 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          Bulk Apply — fill once, apply to all pending images
        </h3>
        @if (profileService.hasProfile()) {
          <button (click)="loadProfile()"
                  class="cursor-pointer text-xs text-neon-cyan hover:text-neon-cyan/80 underline underline-offset-2 transition-colors">
            Load saved profile
          </button>
        }
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label class="block text-[10px] font-medium text-space-400 uppercase tracking-wider mb-1" for="bulk-callsign">
            Callsign
          </label>
          <input id="bulk-callsign" [(ngModel)]="callsign"
                 class="w-full bg-space-900 border border-space-600 rounded-md px-2.5 py-1.5 text-sm text-space-100
                        placeholder:text-space-500 focus:outline-none focus:ring-2 focus:ring-neon-cyan/40 focus:border-neon-cyan/50
                        transition-all"
                 placeholder="AA1XYZ">
        </div>
        <div>
          <label class="block text-[10px] font-medium text-space-400 uppercase tracking-wider mb-1" for="bulk-name">
            Operator Name
          </label>
          <input id="bulk-name" [(ngModel)]="operatorName"
                 class="w-full bg-space-900 border border-space-600 rounded-md px-2.5 py-1.5 text-sm text-space-100
                        placeholder:text-space-500 focus:outline-none focus:ring-2 focus:ring-neon-cyan/40 focus:border-neon-cyan/50
                        transition-all"
                 placeholder="Jane Doe">
        </div>
        <div>
          <label class="block text-[10px] font-medium text-space-400 uppercase tracking-wider mb-1" for="bulk-grid">
            Grid Square
          </label>
          <input id="bulk-grid" [(ngModel)]="gridSquare"
                 class="w-full bg-space-900 border border-space-600 rounded-md px-2.5 py-1.5 text-sm text-space-100
                        placeholder:text-space-500 focus:outline-none focus:ring-2 focus:ring-neon-cyan/40 focus:border-neon-cyan/50
                        transition-all"
                 placeholder="FN42"
                 maxlength="6">
        </div>
        <div class="flex items-end">
          <button (click)="apply()"
                  [disabled]="!callsign() && !operatorName() && !gridSquare()"
                  class="w-full bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 rounded-md px-4 py-1.5 text-sm font-medium
                         hover:bg-neon-cyan/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            Apply to All ({{ fileCount() }})
          </button>
        </div>
      </div>
    </div>
  `,
})
export class BulkOperationsBarComponent {
  readonly applyToAll = output<{ callsign: string; operatorName: string; gridSquare: string }>();
  readonly fileCount = input(0);

  readonly callsign = signal('');
  readonly operatorName = signal('');
  readonly gridSquare = signal('');

  constructor(protected profileService: OperatorStoreService) {}

  loadProfile(): void {
    const p = this.profileService.profile();
    this.callsign.set(p.callsign);
    this.operatorName.set(p.name);
    this.gridSquare.set(p.gridSquare);
  }

  apply(): void {
    this.applyToAll.emit({
      callsign: this.callsign(),
      operatorName: this.operatorName(),
      gridSquare: this.gridSquare(),
    });
  }
}
