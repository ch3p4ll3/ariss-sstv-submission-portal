import { Component, input, output, computed } from '@angular/core';
import { UploadFileEntry } from '../../../models/sstv-submission.model';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';
import { ValidationBadgeComponent, ValidationLevel } from '../../shared/validation-badge/validation-badge.component';

@Component({
  selector: 'app-image-preview-card',
  standalone: true,
  imports: [ProgressBarComponent, ValidationBadgeComponent],
  template: `
    <div class="group relative rounded-lg overflow-hidden border transition-all duration-200"
         [class]="cardClass()"
         [class.ring-2]="selected()"
         [class.ring-neon-cyan/50]="selected()"
         (click)="select.emit(entry().id)"
         (keydown.enter)="select.emit(entry().id)"
         tabindex="0"
         role="button"
         [attr.aria-label]="'Image ' + entry().file.name">

      <!-- Thumbnail -->
      <div class="aspect-[4/3] bg-space-800 overflow-hidden relative">
        <img [src]="entry().localPreviewUrl"
             [alt]="entry().file.name"
             class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
             loading="lazy">

        <!-- Status overlay -->
        @if (entry().status === 'uploading') {
          <div class="absolute inset-0 bg-space-900/60 flex items-center justify-center">
            <div class="w-3/4">
              <p class="text-xs text-space-200 mb-1 text-center">Uploading...</p>
              <app-progress-bar [progress]="entry().progress" />
            </div>
          </div>
        }
        @if (entry().status === 'failed') {
          <div class="absolute inset-0 bg-red-900/40 flex items-center justify-center">
            <div class="text-center px-3">
              <p class="text-xs text-red-300 font-medium">Upload failed</p>
              @if (entry().error) {
                <p class="text-[10px] text-red-400 mt-0.5 truncate max-w-full">{{ entry().error }}</p>
              }
            </div>
          </div>
        }
        @if (entry().status === 'completed') {
          <div class="absolute top-2 right-2 w-6 h-6 rounded-full bg-neon-green flex items-center justify-center">
            <svg class="w-3.5 h-3.5 text-space-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        }

        <!-- Action buttons (hover) -->
        <div class="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button (click)="rotate.emit(entry().id); $event.stopPropagation()"
                  class="cursor-pointer p-1.5 rounded-md bg-space-900/80 text-space-200 hover:text-white hover:bg-space-700/80 transition-colors"
                  [attr.aria-label]="'Rotate image'">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button (click)="remove.emit(entry().id); $event.stopPropagation()"
                  class="cursor-pointer p-1.5 rounded-md bg-space-900/80 text-red-400 hover:text-red-300 hover:bg-red-900/50 transition-colors"
                  [attr.aria-label]="'Remove image'">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Metadata footer -->
      <div class="p-2.5 space-y-1.5 bg-space-850">
        <p class="text-xs text-space-300 truncate" [title]="entry().file.name">{{ entry().file.name }}</p>

        <div class="flex items-center gap-2 text-[10px] text-space-400">
          <span>{{ entry().width }}x{{ entry().height }}</span>
          <span>&middot;</span>
          <span>{{ formatSize(entry().fileSizeBytes) }}</span>
          @if (entry().imageHash) {
            <span class="ml-auto font-mono">{{ entry().imageHash.slice(0, 8) }}</span>
          }
        </div>

        @if (entry().callsign) {
          <div class="flex items-center gap-1.5 text-[10px]">
            <span class="font-mono text-neon-cyan/80 font-semibold">{{ entry().callsign }}</span>
            @if (entry().gridSquare) {
              <span class="text-space-400">{{ entry().gridSquare }}</span>
            }
          </div>
        }

        @if (!entry().captureTimestampUtc) {
          <app-validation-badge level="warning" message="No timestamp detected" />
        }
        @if (hasInvalidDimensions()) {
          <app-validation-badge level="error" message="Unusual SSTV dimensions" />
        }
      </div>
    </div>
  `,
})
export class ImagePreviewCardComponent {
  readonly entry = input.required<UploadFileEntry>();
  readonly selected = input(false);
  readonly select = output<string>();
  readonly remove = output<string>();
  readonly rotate = output<string>();

  readonly VALID_SSTV_HEIGHTS = [120, 240, 256, 400, 480, 496, 576, 616, 625];
  readonly VALID_SSTV_WIDTHS = [160, 256, 320, 400, 640];

  readonly cardClass = computed(() => {
    const s = this.entry().status;
    if (s === 'completed') return 'border-neon-green/30 bg-space-850';
    if (s === 'failed') return 'border-red-500/30 bg-space-850';
    if (s === 'uploading') return 'border-neon-cyan/30 bg-space-850';
    return 'border-space-700 bg-space-850 hover:border-space-500';
  });

  readonly hasInvalidDimensions = computed(() => {
    const e = this.entry();
    if (!e.width || !e.height) return false;
    return !(this.VALID_SSTV_WIDTHS.includes(e.width) && this.VALID_SSTV_HEIGHTS.includes(e.height));
  });

  protected formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }
}
