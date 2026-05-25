import { Component, output, signal, HostListener, computed } from '@angular/core';

export type DropState = 'idle' | 'dragging' | 'processing';

@Component({
  selector: 'app-dropzone',
  standalone: true,
  template: `
    <div
      class="relative border-2 border-dashed rounded-xl p-16 text-center cursor-pointer
             transition-all duration-200
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/50
             group"
      [class]="containerClass()"
      (click)="fileInput.click()"
      (drop)="onDrop($event)"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave()"
      tabindex="0"
      role="button"
      [attr.aria-label]="'Upload SSTV images. Click or drag and drop files.'"
      (keydown.enter)="fileInput.click()"
      (keydown.space)="fileInput.click(); $event.preventDefault()"
    >
      <input
        #fileInput
        type="file"
        accept="image/png,image/jpeg,image/webp,image/bmp,image/gif"
        multiple
        class="sr-only"
        (change)="onFileSelected($event)"
        [attr.aria-hidden]="true"
      >

      <div class="flex flex-col items-center gap-4">
        <!-- Upload icon -->
        <div class="w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-200"
             [class]="iconClass()">
          <svg class="w-8 h-8" [class]="iconColorClass()" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>

        <div class="space-y-1">
          <p class="text-lg font-medium" [class]="textClass()">
            @switch (dropState()) {
              @case ('dragging') { Drop files here }
              @case ('processing') { Processing files... }
              @default { Drag & drop SSTV images or <span class="underline underline-offset-2">browse</span> }
            }
          </p>
          <p class="text-sm text-space-400">
            PNG, JPEG, WebP — up to 50MB each
          </p>
        </div>
      </div>
    </div>
  `,
})
export class DropzoneComponent {
  readonly filesSelected = output<File[]>();

  readonly dropState = signal<DropState>('idle');

  readonly containerClass = computed(() => {
    switch (this.dropState()) {
      case 'dragging': return 'border-neon-cyan bg-neon-cyan/5 scale-[1.01]';
      case 'processing': return 'border-space-500 bg-space-800/50 opacity-60 pointer-events-none';
      default: return 'border-space-600 bg-space-800/30 hover:border-space-400 hover:bg-space-800/50';
    }
  });

  readonly iconClass = computed(() => {
    switch (this.dropState()) {
      case 'dragging': return 'bg-neon-cyan/20';
      default: return 'bg-space-700 group-hover:bg-space-600';
    }
  });

  readonly iconColorClass = computed(() => {
    switch (this.dropState()) {
      case 'dragging': return 'text-neon-cyan';
      default: return 'text-space-300 group-hover:text-space-200';
    }
  });

  readonly textClass = computed(() => {
    switch (this.dropState()) {
      case 'dragging': return 'text-neon-cyan';
      default: return 'text-space-200';
    }
  });

  @HostListener('dragenter', ['$event'])
  onDragEnter(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    if (this.dropState() !== 'processing') {
      this.dropState.set('dragging');
    }
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
  }

  onDragLeave(): void {
    if (this.dropState() === 'dragging') {
      this.dropState.set('idle');
    }
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer?.files ?? []);
    if (files.length > 0) {
      this.emitFiles(files);
    }
    this.dropState.set('idle');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (files.length > 0) {
      this.emitFiles(files);
    }
    input.value = '';
  }

  private emitFiles(files: File[]): void {
    this.dropState.set('processing');
    const images = files.filter(f => f.type.startsWith('image/'));
    this.filesSelected.emit(images);
    setTimeout(() => this.dropState.set('idle'), 600);
  }
}
