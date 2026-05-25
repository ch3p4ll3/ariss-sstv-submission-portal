import { Component, signal, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DropzoneComponent } from './dropzone/dropzone.component';
import { ReviewGridComponent } from './review-grid/review-grid.component';
import { BulkOperationsBarComponent } from './bulk-operations-bar/bulk-operations-bar.component';
import { StationDetailsComponent } from './station-details/station-details.component';
import { SubmitCompleteComponent, SubmitPhase } from './submit-complete/submit-complete.component';
import { UploadService } from '../../services/upload.service';
import { ExifParserService } from '../../services/exif-parser.service';
import { UploadFileEntry, OperatorProfile } from '../../models';
import { MissionService } from '../../services/mission.service';

export type UploadStep = 'select' | 'review' | 'details' | 'submit';

@Component({
  selector: 'app-batch-upload',
  standalone: true,
  imports: [
    RouterLink,
    DropzoneComponent,
    ReviewGridComponent,
    BulkOperationsBarComponent,
    StationDetailsComponent,
    SubmitCompleteComponent,
  ],
  template: `
    <div class="min-h-screen bg-cosmic-950">
      <!-- Header -->
      <header class="border-b border-space-800/60 bg-space-900/40 backdrop-blur-md sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <a routerLink="/" class="cursor-pointer flex items-center gap-2 text-space-100 hover:text-white transition-colors">
              <svg class="w-7 h-7 text-neon-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
              <span class="font-semibold text-sm">ARISS SSTV</span>
            </a>
          </div>

          <!-- Step indicator (desktop) -->
          <nav class="hidden sm:flex items-center gap-1" aria-label="Upload progress">
            @for (step of steps; track step.key; let i = $index) {
              <div class="flex items-center">
                @if (i > 0) {
                  <div class="w-6 h-px" [class.bg-neon-cyan]="stepIndex() >= i" [class.bg-space-600]="stepIndex() < i"></div>
                }
                <button (click)="goToStep(step.key)"
                        [disabled]="isStepLocked(step.key)"
                        class="cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all
                               disabled:cursor-not-allowed"
                        [class]="stepButtonClass(step.key)"
                        [attr.aria-current]="currentStep() === step.key ? 'step' : undefined">
                  @if (stepIndex() > i) {
                    <span class="w-4 h-4 rounded-full bg-neon-cyan/20 text-neon-cyan flex items-center justify-center">
                      <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </span>
                  } @else {
                    <span class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                          [class.bg-neon-cyan]="currentStep() === step.key"
                          [class.bg-space-600]="currentStep() !== step.key"
                          [class.text-space-950]="currentStep() === step.key"
                          [class.text-space-300]="currentStep() !== step.key">
                      {{ i + 1 }}
                    </span>
                  }
                  <span>{{ step.label }}</span>
                </button>
              </div>
            }
          </nav>

          <!-- Mobile step indicator -->
          <nav class="sm:hidden flex items-center gap-2 text-xs text-space-400" aria-label="Upload progress">
            <span class="font-medium text-space-200">Step {{ stepIndex() + 1 }}</span>
            <span>/</span>
            <span>{{ steps[stepIndex()].label }}</span>
            @if (uploadService.totalCount() > 0) {
              <span class="ml-auto bg-space-800 rounded-full px-2 py-0.5">{{ uploadService.totalCount() }}</span>
            }
          </nav>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 py-8">
        @switch (currentStep()) {
          @case ('select') {
            <section class="max-w-2xl mx-auto">
              <div class="text-center mb-8">
                <h1 class="text-2xl font-bold text-space-100">Upload SSTV Images</h1>
                <p class="text-sm text-space-400 mt-1">
                  Select images captured during ARISS SSTV transmissions.
                  @if (uploadService.totalCount() > 0) {
                    <span class="text-space-300">Currently {{ uploadService.totalCount() }} file{{ uploadService.totalCount() !== 1 ? 's' : '' }} selected — new files will be added.</span>
                  }
                </p>
              </div>
              <app-dropzone (filesSelected)="onFilesSelected($event)" />
            </section>
          }

          @case ('review') {
            <section>
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-space-100">Review Images</h2>
                <div class="flex items-center gap-2">
                  <button (click)="currentStep.set('select')"
                          class="cursor-pointer text-xs text-neon-cyan hover:text-neon-cyan/80 border border-neon-cyan/20 rounded-md px-3 py-1.5 transition-all">
                    Add more files
                  </button>
                  @if (uploadService.totalCount() > 0) {
                    <button (click)="onClearAll()"
                            class="cursor-pointer text-xs text-red-400 hover:text-red-300 border border-red-400/20 rounded-md px-3 py-1.5 transition-all">
                      Clear all
                    </button>
                  }
                </div>
              </div>
              <app-bulk-operations-bar (applyToAll)="onApplyToAll($event)" [fileCount]="uploadService.totalCount()" />
              <div class="mt-4">
                <app-review-grid [entries]="uploadService.files()"
                                 (remove)="onRemoveFile($event)"
                                 (rotate)="onRotateImage($event)"
                                 (preview)="onPreviewImage($event)" />
              </div>
              @if (uploadService.totalCount() > 0) {
                <div class="flex justify-end mt-6">
                  <button (click)="currentStep.set('details')"
                          class="cursor-pointer px-6 py-2 text-sm font-semibold bg-neon-cyan text-space-950 rounded-md
                                 hover:bg-neon-cyan/90 transition-all">
                    Continue — Enter Station Details
                  </button>
                </div>
              }
            </section>
          }

          @case ('details') {
            <section class="max-w-3xl mx-auto">
              <h2 class="text-lg font-semibold text-space-100 mb-6">Station & Signal Details</h2>
              <app-station-details (back)="currentStep.set('review')"
                                   (proceed)="onDetailsProceed($event)" />
            </section>
          }

          @case ('submit') {
            <section class="max-w-4xl mx-auto">
              <app-submit-complete [phase]="submitPhase()"
                                   [files]="uploadService.files()"
                                   [operatorCallsign]="operatorCallsign()"
                                   [operatorName]="operatorName()"
                                   [operatorGrid]="operatorGrid()"
                                   [operatorEmail]="operatorEmail()"
                                   [totalCount]="uploadService.totalCount()"
                                   [completedCount]="uploadService.completedCount()"
                                   [failedCount]="uploadService.failedCount()"
                                   [overallProgress]="uploadService.overallProgress()"
                                   [hasFailures]="uploadService.hasFailures()"
                                   (back)="onBackFromConfirm()"
                                   (submitAll)="onSubmitAll()"
                                   (removeFile)="onRemoveFile($event)"
                                   (retry)="onRetry()"
                                   (viewGallery)="onViewGallery()"
                                   (uploadMore)="onUploadMore()" />
            </section>
          }
        }
      </main>
    </div>
  `,
})
export class BatchUploadComponent {
  readonly uploadService = inject(UploadService);
  readonly exifParser = inject(ExifParserService);
  readonly missionService = inject(MissionService);
  readonly router = inject(Router);

  readonly currentStep = signal<UploadStep>('select');
  readonly submitPhase = signal<SubmitPhase>('confirm');

  readonly operatorCallsign = signal('');
  readonly operatorName = signal('');
  readonly operatorGrid = signal('');
  readonly operatorEmail = signal('');

  readonly steps = [
    { key: 'select' as const, label: 'Select' },
    { key: 'review' as const, label: 'Review' },
    { key: 'details' as const, label: 'Details' },
    { key: 'submit' as const, label: 'Confirm & Submit' },
  ];

  readonly stepIndex = computed(() => this.steps.findIndex(s => s.key === this.currentStep()));

  isStepLocked(stepKey: UploadStep): boolean {
    if (this.currentStep() === 'submit') return true;
    return stepKey === 'submit' || stepKey === 'details';
  }

  stepButtonClass(stepKey: UploadStep): string {
    const idx = this.steps.findIndex(s => s.key === stepKey);
    const cur = this.stepIndex();
    if (idx < cur) return 'text-neon-cyan hover:text-neon-cyan/80';
    if (idx === cur) return 'text-space-100 bg-space-800/50';
    return 'text-space-500 cursor-not-allowed';
  }

  goToStep(step: UploadStep): void {
    if (step === 'select' || step === 'review') {
      this.currentStep.set(step);
    }
  }

  async onFilesSelected(files: File[]): Promise<void> {
    const entries: UploadFileEntry[] = [];

    for (const file of files) {
      const id = crypto.randomUUID();
      const localPreviewUrl = URL.createObjectURL(file);
      const metadata = await this.exifParser.parse(file);

      entries.push({
        id,
        file,
        localPreviewUrl,
        status: 'pending',
        progress: 0,
        error: null,
        callsign: '',
        operatorName: '',
        gridSquare: '',
        captureTimestampUtc: metadata.captureTimestampUtc,
        missionId: null,
        imageHash: metadata.imageHash,
        width: metadata.width,
        height: metadata.height,
        fileSizeBytes: metadata.fileSizeBytes,
        sstvMode: null,
        signalReport: null,
        description: '',
        retryCount: 0,
      });
    }

    this.uploadService.addFiles(entries);
    this.currentStep.set('review');
  }

  onApplyToAll(data: { callsign: string; operatorName: string; gridSquare: string }): void {
    this.uploadService.applyToAll({
      callsign: data.callsign.toUpperCase(),
      operatorName: data.operatorName,
      gridSquare: data.gridSquare.toUpperCase(),
    });
  }

  onRemoveFile(id: string): void {
    this.uploadService.removeFile(id);
  }

  onClearAll(): void {
    this.uploadService.clearAll();
  }

  onRotateImage(id: string): void {
    const entry = this.uploadService.files().find(f => f.id === id);
    if (!entry) return;
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalHeight;
      canvas.height = img.naturalWidth;
      const ctx = canvas.getContext('2d')!;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      const dataUrl = canvas.toDataURL('image/webp', 0.9);
      this.uploadService.updateFile(id, {
        localPreviewUrl: dataUrl,
        width: img.naturalHeight,
        height: img.naturalWidth,
      });
    };
    img.src = entry.localPreviewUrl;
  }

  onPreviewImage(_id: string): void {
    // Future: lightbox preview
  }

  onDetailsProceed(profile: OperatorProfile): void {
    this.uploadService.applyToAll({
      callsign: profile.callsign,
      operatorName: profile.name,
      gridSquare: profile.gridSquare,
      signalReport: profile.defaultSignalReport ?? { rst: 0, qrm: 1, qrn: 1, qsb: 1 },
    });

    this.operatorCallsign.set(profile.callsign);
    this.operatorName.set(profile.name);
    this.operatorGrid.set(profile.gridSquare);
    this.operatorEmail.set(profile.email);
    this.submitPhase.set('confirm');
    this.currentStep.set('submit');
  }

  onBackFromConfirm(): void {
    this.currentStep.set('details');
  }

  async onSubmitAll(): Promise<void> {
    this.submitPhase.set('uploading');
    try {
      await this.uploadService.uploadAll();
    } finally {
      this.submitPhase.set('complete');
    }
  }

  onRetry(): void {
    void this.uploadService.retryFailed();
  }

  onViewGallery(): void {
    void this.router.navigate(['/gallery']);
  }

  onUploadMore(): void {
    this.uploadService.clearAll();
    this.submitPhase.set('confirm');
    this.currentStep.set('select');
  }
}
