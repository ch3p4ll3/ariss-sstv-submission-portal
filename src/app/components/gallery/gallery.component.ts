import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GalleryFilterBarComponent } from './gallery-filter-bar/gallery-filter-bar.component';
import { GalleryGridComponent } from './gallery-grid/gallery-grid.component';
import { LightboxModalComponent } from './lightbox-modal/lightbox-modal.component';
import { GalleryService } from '../../services/gallery.service';
import { GalleryFilterCriteria } from '../../models/gallery-filter.model';
import { SstvSubmission } from '../../models/sstv-submission.model';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [RouterLink, GalleryFilterBarComponent, GalleryGridComponent, LightboxModalComponent],
  template: `
    <div class="min-h-screen bg-cosmic-950">
      <!-- Header -->
      <header class="border-b border-space-800/60 bg-space-900/40 backdrop-blur-md sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <a routerLink="/" class="cursor-pointer flex items-center gap-2 text-space-100 hover:text-white transition-colors">
              <svg class="w-7 h-7 text-neon-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span class="font-semibold text-sm">ARISS SSTV Gallery</span>
            </a>
          </div>
          <a routerLink="/upload"
             class="cursor-pointer text-xs text-neon-cyan hover:text-neon-cyan/80 border border-neon-cyan/30 rounded-md px-3 py-1.5
                    hover:bg-neon-cyan/10 transition-all">
            Upload Images
          </a>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <app-gallery-filter-bar (filterChange)="onFilterChange($event)"
                                 [totalCount]="gallery.totalCount()" />

        <app-gallery-grid [images]="gallery.images()"
                          [isLoading]="gallery.isLoading()"
                          [hasMore]="gallery.hasMore()"
                          (select)="onSelectImage($event)"
                          (loadMore)="onLoadMore()" />
      </main>

      @if (gallery.selectedImage(); as selected) {
        <app-lightbox-modal [image]="selected"
                            [hasPrev]="hasPrev()"
                            [hasNext]="hasNext()"
                            (close)="gallery.selectImage(null)"
                            (prev)="onPrevImage()"
                            (next)="onNextImage()" />
      }
    </div>
  `,
})
export class GalleryComponent {
  readonly gallery = inject(GalleryService);

  readonly imageIndex = signal(-1);

  readonly hasPrev = computed(() => this.imageIndex() > 0);
  readonly hasNext = computed(() => this.imageIndex() < this.gallery.images().length - 1);

  ngOnInit(): void {
    void this.gallery.loadPage(1);
  }

  onFilterChange(criteria: Partial<GalleryFilterCriteria>): void {
    this.gallery.updateFilter(criteria);
  }

  onSelectImage(image: SstvSubmission): void {
    this.imageIndex.set(this.gallery.images().findIndex(i => i.id === image.id));
    this.gallery.selectImage(image);
  }

  onLoadMore(): void {
    void this.gallery.loadMore();
  }

  onPrevImage(): void {
    const idx = this.imageIndex() - 1;
    if (idx >= 0) {
      this.imageIndex.set(idx);
      this.gallery.selectImage(this.gallery.images()[idx]);
    }
  }

  onNextImage(): void {
    const idx = this.imageIndex() + 1;
    if (idx < this.gallery.images().length) {
      this.imageIndex.set(idx);
      this.gallery.selectImage(this.gallery.images()[idx]);
    }
  }
}
