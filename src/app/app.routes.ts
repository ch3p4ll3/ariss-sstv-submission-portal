import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/gallery',
    pathMatch: 'full',
  },
  {
    path: 'upload',
    loadComponent: () =>
      import('./components/batch-upload/batch-upload.component').then(
        (c) => c.BatchUploadComponent,
      ),
    title: 'Upload SSTV Images — ARISS Gallery',
  },
  {
    path: 'gallery',
    loadComponent: () =>
      import('./components/gallery/gallery.component').then(
        (c) => c.GalleryComponent,
      ),
    title: 'SSTV Image Gallery — ARISS',
  },
  {
    path: 'gallery/:id',
    loadComponent: () =>
      import('./components/gallery/gallery.component').then(
        (c) => c.GalleryComponent,
      ),
    title: 'SSTV Image — ARISS Gallery',
  },
  {
    path: '**',
    redirectTo: '/gallery',
  },
];
