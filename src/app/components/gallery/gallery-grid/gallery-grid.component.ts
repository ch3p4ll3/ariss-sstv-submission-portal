import { Component, input, output, computed, ElementRef, viewChild, afterNextRender } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SstvSubmission } from '../../../models/sstv-submission.model';

@Component({
  selector: 'app-gallery-grid',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="relative">
      @if (isLoading()) {
        <div class="flex items-center justify-center py-20">
          <div class="flex flex-col items-center gap-3">
            <svg class="w-8 h-8 text-neon-cyan animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span class="text-sm text-space-400">Loading gallery...</span>
          </div>
        </div>
      } @else if (images().length === 0) {
        <div class="flex flex-col items-center justify-center py-20 text-center">
          <svg class="w-12 h-12 text-space-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <p class="text-sm text-space-400">No images found matching your filters.</p>
        </div>
      } @else {
        <!-- Responsive masonry grid -->
        <div class="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3 space-y-3">
          @for (image of images(); track image.id) {
            <div class="break-inside-avoid">
              <button (click)="select.emit(image)"
                      class="cursor-pointer group relative w-full rounded-lg overflow-hidden border border-space-700/50
                             hover:border-neon-cyan/30 hover:shadow-lg hover:shadow-neon-cyan/5
                             transition-all duration-200 text-left focus-visible:outline-none focus-visible:ring-2
                             focus-visible:ring-neon-cyan/50"
                      [attr.aria-label]="'View image by ' + image.callsign">

                <img [src]="image.thumbnailUrl"
                     [alt]="'SSTV image from ' + image.callsign"
                     class="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                     loading="lazy"
                     (error)="onImageError($event)">

                <!-- Hover overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-space-950/80 via-transparent to-transparent
                            opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
                  <span class="text-xs font-mono text-neon-cyan font-semibold">{{ image.callsign }}</span>
                  <span class="text-[10px] text-space-300">{{ image.captureTimestampUtc | date:'medium' }}</span>
                </div>

                <!-- Mission badge -->
                @if (image.missionName) {
                  <div class="absolute top-2 left-2 bg-space-950/70 text-[9px] text-space-300 rounded px-1.5 py-0.5 truncate max-w-[120px]">
                    {{ image.missionName }}
                  </div>
                }

                <!-- Certificate badge -->
                @if (image.certificateUrl) {
                  <div class="absolute top-2 right-2" title="Certificate awarded">
                    <svg class="w-4 h-4 text-neon-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982 3.172M9.497 14.25a7.454 7.454 0 00.981 3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.896m0 0a6.023 6.023 0 01-2.77-.896m0 0A5.964 5.964 0 0112 8.8" />
                    </svg>
                  </div>
                }

                <!-- RST badge -->
                @if (image.signalReport) {
                  <div class="absolute bottom-2 right-2 bg-space-950/60 text-[9px] text-space-300 rounded px-1.5 py-0.5">
                    RST {{ image.signalReport.rst }}/{{ image.signalReport.qrm }}/{{ image.signalReport.qrn }}
                  </div>
                }
              </button>
            </div>
          }
        </div>

        <!-- Infinite scroll sentinel -->
        @if (hasMore()) {
          <div #sentinel class="h-10 flex items-center justify-center mt-4">
            <div class="w-6 h-6 border-2 border-space-600 border-t-neon-cyan rounded-full animate-spin"></div>
          </div>
        }
      }
    </div>
  `,
})
export class GalleryGridComponent {
  readonly images = input.required<SstvSubmission[]>();
  readonly isLoading = input(false);
  readonly hasMore = input(false);
  readonly select = output<SstvSubmission>();
  readonly loadMore = output<void>();

  readonly sentinelEl = viewChild<ElementRef<HTMLElement>>('sentinel');
  private observer: IntersectionObserver | null = null;

  constructor() {
    afterNextRender(() => {
      this.setupObserver();
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private setupObserver(): void {
    const sentinel = this.sentinelEl()?.nativeElement;
    if (!sentinel) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && this.hasMore() && !this.isLoading()) {
          this.loadMore.emit();
        }
      },
      { rootMargin: '200px' },
    );

    this.observer.observe(sentinel);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 256" fill="%23243b53"><rect width="320" height="256"/><text x="160" y="128" text-anchor="middle" fill="%23829ab1" font-size="14">Failed to load</text></svg>';
  }
}
