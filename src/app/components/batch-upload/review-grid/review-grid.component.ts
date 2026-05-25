import { Component, input, output, computed } from '@angular/core';
import { UploadFileEntry } from '../../../models/sstv-submission.model';
import { ImagePreviewCardComponent } from '../image-preview-card/image-preview-card.component';
import { ImageHashService } from '../../../services/image-hash.service';

@Component({
  selector: 'app-review-grid',
  standalone: true,
  imports: [ImagePreviewCardComponent],
  template: `
    <div class="space-y-4">
      <!-- Stats bar -->
      <div class="flex items-center justify-between text-sm text-space-300">
        <span>{{ entries().length }} image{{ entries().length !== 1 ? 's' : '' }} selected</span>
        <div class="flex items-center gap-4">
          @if (duplicateCount() > 0) {
            <span class="text-neon-amber font-medium">{{ duplicateCount() }} duplicate{{ duplicateCount() !== 1 ? 's' : '' }} detected</span>
          }
          <span>{{ validCount() }} valid</span>
          <span class="text-red-400">{{ invalidCount() }} flagged</span>
        </div>
      </div>

      <!-- Duplicate warning banner -->
      @if (duplicateCount() > 0) {
        <div class="bg-neon-amber/5 border border-neon-amber/20 rounded-lg p-3 flex items-center gap-2 text-sm text-neon-amber">
          <span>&#x26A0;</span>
          <span>{{ duplicateDetail() }}</span>
        </div>
      }

      <!-- Virtual-scrolled grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3" role="list">
        @for (entry of entries(); track entry.id) {
          <app-image-preview-card
            [entry]="entry"
            (remove)="remove.emit($event)"
            (rotate)="rotate.emit($event)"
            (select)="preview.emit($event)"
            role="listitem" />
        }
      </div>
    </div>
  `,
})
export class ReviewGridComponent {
  readonly entries = input.required<UploadFileEntry[]>();
  readonly remove = output<string>();
  readonly rotate = output<string>();
  readonly preview = output<string>();

  constructor(private hashService: ImageHashService) {}

  readonly duplicateGroups = computed(() => {
    const groups = this.hashService.findDuplicates(this.entries());
    const entries = new Set<string>();
    for (const [, group] of groups) {
      for (const e of group) entries.add(e.id);
    }
    return entries;
  });

  readonly duplicateCount = computed(() => this.duplicateGroups().size);
  readonly duplicateDetail = computed(() => {
    const groups = this.hashService.findDuplicates(this.entries());
    const details: string[] = [];
    for (const [, group] of groups) {
      details.push(`"${group[0].file.name}" appears ${group.length} times`);
    }
    return details.join('; ');
  });

  readonly validCount = computed(() => this.entries().filter(e => e.width > 0).length);
  readonly invalidCount = computed(() => this.entries().filter(e => !e.width || !e.height).length);
}
