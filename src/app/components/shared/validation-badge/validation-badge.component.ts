import { Component, input, computed } from '@angular/core';

export type ValidationLevel = 'info' | 'warning' | 'error' | 'success';

@Component({
  selector: 'app-validation-badge',
  standalone: true,
  template: `
    <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
         [class]="containerClass()">
      <span [innerHTML]="icon()"></span>
      <span>{{ message() }}</span>
    </div>
  `,
})
export class ValidationBadgeComponent {
  readonly level = input<ValidationLevel>('info');
  readonly message = input.required<string>();

  readonly containerClass = computed(() => {
    switch (this.level()) {
      case 'warning': return 'bg-neon-amber/10 text-neon-amber border border-neon-amber/20';
      case 'error': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'success': return 'bg-neon-green/10 text-neon-green border border-neon-green/20';
      default: return 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20';
    }
  });

  readonly icon = computed(() => {
    switch (this.level()) {
      case 'warning': return '&#x26A0;';
      case 'error': return '&#x2716;';
      case 'success': return '&#x2714;';
      default: return '&#x2139;';
    }
  });
}
