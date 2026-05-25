import { Component, input, output, HostListener, signal } from '@angular/core';
import { SstvSubmission } from '../../../models/sstv-submission.model';

@Component({
  selector: 'app-lightbox-modal',
  standalone: true,
  template: `
    @if (image(); as img) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-space-950/90 backdrop-blur-sm"
           (click)="close.emit()"
           role="dialog"
           aria-modal="true"
           [attr.aria-label]="'Image by ' + img.callsign">

        <div class="relative max-w-5xl w-full max-h-[95vh] mx-4 flex flex-col lg:flex-row gap-0 rounded-xl overflow-hidden bg-space-900 border border-space-700 shadow-2xl"
             (click)="$event.stopPropagation()">

          <!-- Image panel -->
          <div class="flex-1 min-w-0 flex items-center justify-center bg-space-950 p-2 relative">
            <img [src]="img.imageUrl"
                 [alt]="'SSTV image from ' + img.callsign"
                 class="max-w-full max-h-[70vh] lg:max-h-[85vh] object-contain rounded-lg">

            <!-- Image nav arrows -->
            @if (hasPrev()) {
              <button (click)="prev.emit(); $event.stopPropagation()"
                      class="cursor-pointer absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-space-900/80 text-space-200
                             hover:bg-space-800 hover:text-white transition-all"
                      aria-label="Previous image">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
            }
            @if (hasNext()) {
              <button (click)="next.emit(); $event.stopPropagation()"
                      class="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-space-900/80 text-space-200
                             hover:bg-space-800 hover:text-white transition-all"
                      aria-label="Next image">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            }
          </div>

          <!-- Metadata panel -->
          <div class="w-full lg:w-80 bg-space-900 border-t lg:border-t-0 lg:border-l border-space-700 overflow-y-auto">
            <div class="p-4 space-y-4">
              <!-- Close button -->
              <div class="flex justify-end">
                <button (click)="close.emit()"
                        class="cursor-pointer p-1.5 rounded-md text-space-400 hover:text-space-100 hover:bg-space-700 transition-all"
                        aria-label="Close lightbox">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Operator info -->
              <div>
                <h3 class="text-lg font-bold text-space-100 font-mono">{{ img.callsign }}</h3>
                @if (img.operatorName) {
                  <p class="text-sm text-space-400">{{ img.operatorName }}</p>
                }
                @if (img.gridSquare) {
                  <p class="text-xs text-space-500 font-mono">{{ img.gridSquare }}</p>
                }
              </div>

              <hr class="border-space-700">

              <!-- Mission -->
              <div>
                <span class="text-[10px] text-space-500 uppercase tracking-wider">Mission</span>
                <p class="text-sm text-space-200">{{ img.missionName }}</p>
              </div>

              <!-- Capture time -->
              <div>
                <span class="text-[10px] text-space-500 uppercase tracking-wider">Captured (UTC)</span>
                <p class="text-sm text-space-200 font-mono">{{ img.captureTimestampUtc }}</p>
              </div>

              <!-- SSTV Mode -->
              <div>
                <span class="text-[10px] text-space-500 uppercase tracking-wider">SSTV Mode</span>
                <p class="text-sm text-space-200">{{ img.sstvMode }}</p>
              </div>

              <!-- Dimensions -->
              <div>
                <span class="text-[10px] text-space-500 uppercase tracking-wider">Resolution</span>
                <p class="text-sm text-space-200">{{ img.width }} x {{ img.height }}</p>
              </div>

              <!-- Signal Report -->
              @if (img.signalReport) {
                <div>
                  <span class="text-[10px] text-space-500 uppercase tracking-wider">Signal Report</span>
                  <div class="grid grid-cols-4 gap-2 mt-1">
                    <div class="bg-space-800 rounded p-2 text-center">
                      <span class="block text-xs text-neon-cyan font-bold">{{ img.signalReport.rst }}</span>
                      <span class="block text-[9px] text-space-400">RST</span>
                    </div>
                    <div class="bg-space-800 rounded p-2 text-center">
                      <span class="block text-xs text-neon-amber font-bold">{{ img.signalReport.qrm }}</span>
                      <span class="block text-[9px] text-space-400">QRM</span>
                    </div>
                    <div class="bg-space-800 rounded p-2 text-center">
                      <span class="block text-xs text-red-400 font-bold">{{ img.signalReport.qrn }}</span>
                      <span class="block text-[9px] text-space-400">QRN</span>
                    </div>
                    <div class="bg-space-800 rounded p-2 text-center">
                      <span class="block text-xs text-space-200 font-bold">{{ img.signalReport.qsb }}</span>
                      <span class="block text-[9px] text-space-400">QSB</span>
                    </div>
                  </div>
                </div>
              }

              <!-- Description -->
              @if (img.description) {
                <div>
                  <span class="text-[10px] text-space-500 uppercase tracking-wider">Description</span>
                  <p class="text-xs text-space-300 mt-1">{{ img.description }}</p>
                </div>
              }

              <hr class="border-space-700">

              <!-- Actions -->
              <div class="space-y-2">
                <a [href]="img.imageUrl" download
                   class="cursor-pointer flex items-center justify-center gap-2 w-full px-3 py-2 text-sm font-medium
                          bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 rounded-md
                          hover:bg-neon-cyan/20 transition-all">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download Full Resolution
                </a>

                @if (img.certificateUrl) {
                  <a [href]="img.certificateUrl" target="_blank"
                     class="cursor-pointer flex items-center justify-center gap-2 w-full px-3 py-2 text-sm font-medium
                            bg-neon-green/10 text-neon-green border border-neon-green/30 rounded-md
                            hover:bg-neon-green/20 transition-all">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982 3.172M9.497 14.25a7.454 7.454 0 00.981 3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.896m0 0a6.023 6.023 0 01-2.77-.896m0 0A5.964 5.964 0 0112 8.8" />
                    </svg>
                    View Certificate
                  </a>
                }

                <button (click)="copyShareLink(img.id)"
                        class="cursor-pointer flex items-center justify-center gap-2 w-full px-3 py-2 text-sm font-medium
                               text-space-300 border border-space-600 rounded-md hover:bg-space-800 hover:text-space-100 transition-all">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                  </svg>
                  {{ shareCopied() ? 'Link Copied!' : 'Copy Share Link' }}
                </button>
              </div>

              <!-- Upload timestamp -->
              <p class="text-[9px] text-space-500 text-center">
                Uploaded {{ img.uploadedAt }}
              </p>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: contents; }
  `]
})
export class LightboxModalComponent {
  readonly image = input<SstvSubmission | null>(null);
  readonly hasPrev = input(false);
  readonly hasNext = input(false);
  readonly close = output<void>();
  readonly prev = output<void>();
  readonly next = output<void>();

  readonly shareCopied = signal(false);

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }

  @HostListener('document:keydown.ArrowLeft')
  onArrowLeft(): void {
    if (this.hasPrev()) this.prev.emit();
  }

  @HostListener('document:keydown.ArrowRight')
  onArrowRight(): void {
    if (this.hasNext()) this.next.emit();
  }

  async copyShareLink(id: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/gallery/${id}`);
      this.shareCopied.set(true);
      setTimeout(() => this.shareCopied.set(false), 2000);
    } catch { /* fallback */ }
  }
}
