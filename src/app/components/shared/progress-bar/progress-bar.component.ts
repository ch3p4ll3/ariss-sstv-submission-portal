import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  template: `
    <div class="w-full bg-space-800 rounded-full h-2 overflow-hidden" role="progressbar"
         [attr.aria-valuenow]="progress()" aria-valuemin="0" aria-valuemax="100">
      <div class="h-full rounded-full transition-all duration-300 ease-out"
           [class]="barClass()" [style.width.%]="progress()">
        @if (progress() > 15) {
          <span class="sr-only">{{ progress() }}% complete</span>
        }
      </div>
    </div>
    @if (showLabel()) {
      <span class="text-xs text-space-300 mt-1 block text-right">{{ progress() }}%</span>
    }
  `,
  host: { 'class': 'block' },
})
export class ProgressBarComponent {
  readonly progress = input.required<number>();
  readonly showLabel = input(false);
  readonly variant = input<'default' | 'success' | 'warning' | 'error'>('default');

  readonly barClass = computed(() => {
    switch (this.variant()) {
      case 'success': return 'bg-neon-green';
      case 'warning': return 'bg-neon-amber';
      case 'error': return 'bg-red-500';
      default: return 'bg-neon-cyan';
    }
  });
}
