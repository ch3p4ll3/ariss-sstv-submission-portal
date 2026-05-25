import { Injectable, signal, computed } from '@angular/core';
import { SstvSubmission } from '../models/sstv-submission.model';
import { GalleryFilterCriteria, GalleryPageResponse, DEFAULT_GALLERY_FILTER } from '../models/gallery-filter.model';

@Injectable({ providedIn: 'root' })
export class GalleryService {
  readonly #images = signal<SstvSubmission[]>([]);
  readonly #filter = signal<GalleryFilterCriteria>(DEFAULT_GALLERY_FILTER);
  readonly #selectedImage = signal<SstvSubmission | null>(null);
  readonly #isLoading = signal(false);
  readonly #totalCount = signal(0);
  readonly #page = signal(1);

  readonly images = this.#images.asReadonly();
  readonly filter = this.#filter.asReadonly();
  readonly selectedImage = this.#selectedImage.asReadonly();
  readonly isLoading = this.#isLoading.asReadonly();
  readonly totalCount = this.#totalCount.asReadonly();
  readonly currentPage = this.#page.asReadonly();
  readonly hasMore = computed(() => this.#images().length < this.#totalCount());

  updateFilter(partial: Partial<GalleryFilterCriteria>): void {
    this.#filter.update(f => ({ ...f, ...partial, page: 1 }));
    this.#page.set(1);
    void this.loadPage(1);
  }

  setPage(page: number): void {
    this.#page.set(page);
    void this.loadPage(page);
  }

  selectImage(image: SstvSubmission | null): void {
    this.#selectedImage.set(image);
  }

  async loadPage(page: number = 1): Promise<void> {
    this.#isLoading.set(true);
    try {
      const response = await this.#fetchPage(this.#filter(), page);
      this.#images.set(response.items);
      this.#totalCount.set(response.totalCount);
      this.#page.set(page);
    } finally {
      this.#isLoading.set(false);
    }
  }

  async loadMore(): Promise<void> {
    if (!this.hasMore() || this.#isLoading()) return;
    const nextPage = this.#page() + 1;
    this.#isLoading.set(true);
    try {
      const response = await this.#fetchPage(this.#filter(), nextPage);
      this.#images.update(imgs => [...imgs, ...response.items]);
      this.#page.set(nextPage);
    } finally {
      this.#isLoading.set(false);
    }
  }

  async #fetchPage(filter: GalleryFilterCriteria, page: number): Promise<GalleryPageResponse> {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(filter.pageSize),
      sortBy: filter.sortBy,
      sortDirection: filter.sortDirection,
      ...(filter.callsign && { callsign: filter.callsign }),
      ...(filter.gridSquare && { gridSquare: filter.gridSquare }),
      ...(filter.missionId && { missionId: filter.missionId }),
      ...(filter.sstvMode && { sstvMode: filter.sstvMode }),
      ...(filter.dateFrom && { dateFrom: filter.dateFrom }),
      ...(filter.dateTo && { dateTo: filter.dateTo }),
      ...(filter.minRst != null && { minRst: String(filter.minRst) }),
    });

    const response = await fetch(`/api/submissions?${params}`);
    if (!response.ok) throw new Error(`Gallery fetch failed: ${response.statusText}`);
    return response.json();
  }
}
