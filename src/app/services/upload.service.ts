import { Injectable, signal, computed } from '@angular/core';
import { UploadFileEntry, ChunkedUploadPayload, BatchSubmitPayload, UploadStatus } from '../models/sstv-submission.model';

const CHUNK_SIZE = 512 * 1024;

@Injectable({ providedIn: 'root' })
export class UploadService {
  readonly #files = signal<UploadFileEntry[]>([]);
  readonly files = this.#files.asReadonly();
  readonly totalCount = computed(() => this.#files().length);
  readonly completedCount = computed(() => this.#files().filter(f => f.status === 'completed').length);
  readonly failedCount = computed(() => this.#files().filter(f => f.status === 'failed').length);
  readonly inProgressCount = computed(() => this.#files().filter(f => f.status === 'uploading' || f.status === 'validating').length);
  readonly overallProgress = computed(() => {
    const files = this.#files();
    if (files.length === 0) return 0;
    const total = files.reduce((s, f) => s + f.progress, 0);
    return Math.round(total / files.length);
  });
  readonly allComplete = computed(() => {
    const files = this.#files();
    return files.length > 0 && files.every(f => f.status === 'completed');
  });
  readonly hasFailures = computed(() => this.failedCount() > 0);

  addFiles(entries: UploadFileEntry[]): void {
    this.#files.update(f => [...f, ...entries]);
  }

  removeFile(id: string): void {
    this.#files.update(f => f.filter(e => e.id !== id));
  }

  updateFile(id: string, partial: Partial<UploadFileEntry>): void {
    this.#files.update(files =>
      files.map(f => f.id === id ? { ...f, ...partial } : f)
    );
  }

  applyToAll(partial: Partial<UploadFileEntry>): void {
    this.#files.update(files =>
      files.map(f => ({
        ...f,
        callsign: partial.callsign ?? f.callsign,
        operatorName: partial.operatorName ?? f.operatorName,
        gridSquare: partial.gridSquare ?? f.gridSquare,
        description: partial.description ?? f.description,
        signalReport: partial.signalReport ?? f.signalReport,
      }))
    );
  }

  clearAll(): void {
    this.#files.set([]);
  }

  async uploadFile(entry: UploadFileEntry): Promise<void> {
    this.updateFile(entry.id, { status: 'uploading', progress: 0 });

    try {
      const totalChunks = Math.ceil(entry.file.size / CHUNK_SIZE);
      const reader = new FileReader();

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, entry.file.size);
        const blob = entry.file.slice(start, end);
        const data = await blob.arrayBuffer();

        const payload: ChunkedUploadPayload = {
          submissionId: entry.id,
          chunkIndex: i,
          totalChunks,
          data: btoa(String.fromCharCode(...new Uint8Array(data))),
          checksum: await this.#checksum(data),
        };

        await this.#sendChunk(payload);

        const progress = Math.round(((i + 1) / totalChunks) * 100);
        this.updateFile(entry.id, { progress });
      }

      this.updateFile(entry.id, { status: 'completed', progress: 100 });
    } catch (err) {
      const retryCount = entry.retryCount + 1;
      if (retryCount < 3) {
        this.updateFile(entry.id, { status: 'pending', retryCount });
        await this.uploadFile({ ...entry, retryCount });
      } else {
        this.updateFile(entry.id, {
          status: 'failed',
          error: err instanceof Error ? err.message : 'Upload failed',
          retryCount,
        });
      }
    }
  }

  async submitBatch(payload: BatchSubmitPayload): Promise<{ success: boolean; submissionIds: string[] }> {
    const response = await fetch('/api/submissions/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Batch submit failed: ${response.statusText}`);
    return response.json();
  }

  async retryFailed(): Promise<void> {
    const failed = this.#files().filter(f => f.status === 'failed');
    for (const f of failed) {
      this.updateFile(f.id, { status: 'pending', error: null, retryCount: 0 });
    }
    await Promise.all(failed.map(f => this.uploadFile(f)));
  }

  async uploadAll(): Promise<void> {
    const pending = this.#files().filter(f => f.status === 'pending');
    console.log(pending);
    await Promise.all(pending.map(f => this.uploadFile(f)));
  }

  async #sendChunk(_payload: ChunkedUploadPayload): Promise<void> {
    await new Promise(r => setTimeout(r, 50));
  }

  async #checksum(data: ArrayBuffer): Promise<string> {
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
