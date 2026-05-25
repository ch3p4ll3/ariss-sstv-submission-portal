import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <router-outlet />
  `,
  host: {
    'class': 'block min-h-screen bg-cosmic-950 text-space-200 antialiased',
  },
})
export class App {}
