import { Component, input, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UploadFileEntry } from '../../../models/sstv-submission.model';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';
import { ImagePreviewCardComponent } from '../image-preview-card/image-preview-card.component';

export type SubmitPhase = 'confirm' | 'uploading' | 'complete';

@Component({
  selector: 'app-submit-complete',
  standalone: true,
  imports: [FormsModule, ProgressBarComponent, ImagePreviewCardComponent],
  template: `
    @switch (phase()) {
      @case ('confirm') {
        <!-- Final review before submission -->
        <div class="space-y-6">
          <div class="text-center">
            <h2 class="text-lg font-semibold text-space-100">Ready to Submit</h2>
            <p class="text-sm text-space-400 mt-1">
              Review everything below before submitting {{ files().length }} image{{ files().length !== 1 ? 's' : '' }}.
            </p>
          </div>

          <!-- Operator summary -->
          <div class="bg-space-800/50 border border-space-700 rounded-lg p-4">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <span class="text-[10px] text-space-500 uppercase tracking-wider">Callsign</span>
                <p class="text-space-100 font-mono font-semibold mt-0.5">{{ operatorCallsign() }}</p>
              </div>
              <div>
                <span class="text-[10px] text-space-500 uppercase tracking-wider">Operator</span>
                <p class="text-space-200 mt-0.5">{{ operatorName() }}</p>
              </div>
              <div>
                <span class="text-[10px] text-space-500 uppercase tracking-wider">Grid Square</span>
                <p class="text-space-100 font-mono mt-0.5">{{ operatorGrid() }}</p>
              </div>
              <div>
                <span class="text-[10px] text-space-500 uppercase tracking-wider">Images</span>
                <p class="text-space-200 mt-0.5">{{ files().length }} file{{ files().length !== 1 ? 's' : '' }}</p>
              </div>
            </div>
          </div>

          <!-- Image grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            @for (entry of files(); track entry.id) {
              <app-image-preview-card [entry]="entry"
                                      (remove)="removeFile.emit($event)" />
            }
          </div>

          <!-- Terms acceptance (required) -->
          <label class="flex items-start gap-3 bg-space-800/30 border border-space-700 rounded-lg p-4 cursor-pointer">
            <input type="checkbox" [ngModel]="termsAccepted()" (ngModelChange)="termsAccepted.set($event)"
                   class="mt-0.5 rounded border-space-600 bg-space-800 text-neon-cyan cursor-pointer focus:ring-neon-cyan/40">
            <div class="text-sm text-space-300 leading-relaxed">
              <span class="font-medium text-space-200">I accept the terms and conditions</span>
              — I confirm that these images are my own SSTV decodes captured during ARISS
              transmissions and I grant permission to display them in the public gallery.
            </div>
          </label>

          <!-- Certificate opt-in (requires valid email) -->
          <div class="bg-space-800/30 border rounded-lg p-4"
               [class.border-space-700]="emailValid()"
               [class.border-neon-amber/30]="!emailValid()">
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" [ngModel]="certRequested()" (ngModelChange)="certRequested.set($event)"
                     [disabled]="!emailValid()"
                     class="mt-0.5 rounded border-space-600 bg-space-800 text-neon-cyan
                            focus:ring-neon-cyan/40 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
              <div class="text-sm text-space-300 leading-relaxed">
                <span class="font-medium text-space-200">I would like to receive an ARISS SSTV certificate</span>
                — Certificates are emailed after manual review following mission close.
              </div>
            </label>
            @if (!emailValid()) {
              <p class="text-xs text-neon-amber mt-2 ml-8">
                Enter a valid email address in the Station Details form to request a certificate.
              </p>
            }
          </div>

          <!-- Actions -->
          <div class="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-2">
            <button (click)="back.emit()"
                    class="w-full sm:w-auto px-4 py-2 text-sm text-space-300 hover:text-space-100 border border-space-600 rounded-md cursor-pointer
                           hover:border-space-400 transition-all">
              Back
            </button>
            <button (click)="submitAll.emit()"
                    [disabled]="!termsAccepted()"
                    class="w-full sm:w-auto px-6 py-2 text-sm font-semibold rounded-md transition-all cursor-pointer
                           bg-neon-cyan text-space-950 hover:bg-neon-cyan/90
                           disabled:opacity-30 disabled:cursor-not-allowed">
              Submit All ({{ files().length }})
            </button>
          </div>
        </div>
      }

      @case ('uploading') {
        <!-- Upload in progress -->
        <div class="space-y-6 text-center py-8">
          <div class="w-20 h-20 mx-auto rounded-full bg-neon-cyan/20 flex items-center justify-center animate-pulse">
            <svg class="w-10 h-10 text-neon-cyan animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-space-100 mt-4">Submitting your images...</h3>
          <p class="text-sm text-space-400 mt-1">Uploading {{ totalCount() }} image{{ totalCount() !== 1 ? 's' : '' }}</p>
          <div class="max-w-sm mx-auto mt-4">
            <app-progress-bar [progress]="overallProgress()" [showLabel]="true" variant="default" />
          </div>
          <p class="text-xs text-space-500 mt-2">{{ completedCount() }} of {{ totalCount() }} complete</p>
        </div>
      }

      @case ('complete') {
        <!-- Upload complete -->
        <div class="space-y-6 text-center py-8">
          <div class="w-20 h-20 mx-auto rounded-full bg-neon-green/20 flex items-center justify-center">
            <svg class="w-10 h-10 text-neon-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-space-100 mt-4">Upload Complete!</h3>
          <p class="text-sm text-space-400 mt-1">
            Successfully submitted {{ completedCount() }} image{{ completedCount() !== 1 ? 's' : '' }}
          </p>

          @if (hasFailures()) {
            <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-3 max-w-sm mx-auto mt-4">
              <p class="text-sm text-red-400">{{ failedCount() }} upload{{ failedCount() !== 1 ? 's' : '' }} failed</p>
            </div>
          }

          <div class="flex justify-center gap-3 mt-6">
            @if (hasFailures()) {
              <button (click)="retry.emit()"
                      class="cursor-pointer px-4 py-2 text-sm font-medium text-neon-amber border border-neon-amber/30 rounded-md
                             hover:bg-neon-amber/10 transition-all">
                Retry Failed
              </button>
            }
            <button (click)="viewGallery.emit()"
                    class="cursor-pointer px-4 py-2 text-sm font-semibold bg-neon-cyan text-space-950 rounded-md
                           hover:bg-neon-cyan/90 transition-all">
              View Gallery
            </button>
            <button (click)="uploadMore.emit()"
                    class="cursor-pointer px-4 py-2 text-sm text-space-300 border border-space-600 rounded-md
                           hover:text-space-100 hover:border-space-400 transition-all">
              Upload More
            </button>
          </div>

          @if (completedCount() > 0 && certRequested()) {
            <div class="border border-space-700 rounded-lg p-5 max-w-md mx-auto mt-6 bg-space-800/30">
              <div class="flex items-center justify-center gap-2 text-neon-green mb-2">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982 3.172M9.497 14.25a7.454 7.454 0 00.981 3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.896m0 0a6.023 6.023 0 01-2.77-.896m0 0A5.964 5.964 0 0112 8.8" />
                </svg>
                <span class="text-sm font-medium">Certificate requested</span>
              </div>
              <p class="text-xs text-space-400">
                ARISS awards are generated within 48 hours after mission close.
              </p>
            </div>
          }
        </div>
      }
    }
  `,
})
export class SubmitCompleteComponent {
  readonly phase = input.required<SubmitPhase>();
  readonly files = input<UploadFileEntry[]>([]);
  readonly operatorCallsign = input('');
  readonly operatorName = input('');
  readonly operatorGrid = input('');
  readonly operatorEmail = input('');

  readonly totalCount = input(0);
  readonly completedCount = input(0);
  readonly failedCount = input(0);
  readonly overallProgress = input(0);
  readonly hasFailures = input(false);

  readonly termsAccepted = signal(false);
  readonly certRequested = signal(false);

  readonly EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  readonly emailValid = computed(() => {
    const email = this.operatorEmail();
    return email.length > 0 && this.EMAIL_PATTERN.test(email);
  });

  readonly back = output<void>();
  readonly submitAll = output<void>();
  readonly retry = output<void>();
  readonly viewGallery = output<void>();
  readonly uploadMore = output<void>();
  readonly removeFile = output<string>();
}
