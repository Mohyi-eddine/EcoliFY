import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/tracks', pathMatch: 'full' },
  { 
    path: 'tracks', 
    loadComponent: () => import('./components/track-list/track-list.component').then(m => m.TrackListComponent)
  },
  { 
    path: 'playlists', 
    loadComponent: () => import('./components/playlist-list/playlist-list.component').then(m => m.PlaylistListComponent)
  },
  { 
    path: 'playlists/:id', 
    loadComponent: () => import('./components/playlist-detail/playlist-detail.component').then(m => m.PlaylistDetailComponent)
  },
  { path: '**', redirectTo: '/tracks' }
];