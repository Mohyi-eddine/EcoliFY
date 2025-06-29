import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouterOutlet, Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app/app.routes';
import { MusicPlayerBarComponent } from './app/components/music-player-bar/music-player-bar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterModule, MusicPlayerBarComponent],
  template: `
    <div class="app-container">
      <nav class="navbar">
        <div class="nav-content">
          <div class="logo-section">
            <div class="logo-icon">🎵</div>
            <h1 class="logo-text">EcoliFy</h1>
          </div>
          <div class="nav-links">
            <a routerLink="/tracks" [class.active]="isActive('/tracks')" class="nav-link">
              <span class="nav-icon">🎵</span>
              <span class="nav-text">Tracks</span>
            </a>
            <a routerLink="/playlists" [class.active]="isActive('/playlists')" class="nav-link">
              <span class="nav-icon">📋</span>
              <span class="nav-text">Playlists</span>
            </a>
          </div>
        </div>
      </nav>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      <!-- Fixed Player Bar -->
      <app-music-player-bar></app-music-player-bar>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: var(--spotify-dark-gray);
      padding-bottom: 90px; /* Space for player bar */
    }
    
    .navbar {
      background: var(--spotify-black);
      border-bottom: 1px solid var(--spotify-lighter-gray);
      padding: var(--spotify-space-md) 0;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: var(--spotify-shadow);
    }
    
    .nav-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--spotify-space-lg);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo-section {
      display: flex;
      align-items: center;
      gap: var(--spotify-space-sm);
    }
    
    .logo-icon {
      font-size: 2rem;
      background: var(--spotify-gradient-2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .logo-text {
      color: var(--spotify-white);
      font-size: 1.5rem;
      font-weight: 900;
      margin: 0;
      letter-spacing: -0.5px;
    }
    
    .nav-links {
      display: flex;
      gap: var(--spotify-space-xl);
    }
    
    .nav-link {
      display: flex;
      align-items: center;
      gap: var(--spotify-space-sm);
      color: var(--spotify-light-text);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.875rem;
      padding: var(--spotify-space-sm) var(--spotify-space-md);
      border-radius: var(--spotify-radius);
      transition: all 0.2s ease;
      text-transform: uppercase;
      letter-spacing: 1px;
      cursor: pointer;
      position: relative;
    }
    
    .nav-link:hover {
      color: var(--spotify-white);
      background: var(--spotify-medium-gray);
      transform: translateY(-1px);
    }
    
    .nav-link.active {
      color: var(--spotify-white);
      background: var(--spotify-light-gray);
    }
    
    .nav-link.active::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 2px;
      background: var(--spotify-green);
      border-radius: 1px;
    }
    
    .nav-icon {
      font-size: 1.1rem;
    }
    
    .main-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--spotify-space-xl) var(--spotify-space-lg);
      min-height: calc(100vh - 200px);
    }
    
    @media (max-width: 768px) {
      .app-container {
        padding-bottom: 120px; /* More space on mobile */
      }
      
      .nav-content {
        padding: 0 var(--spotify-space-md);
      }
      
      .nav-links {
        gap: var(--spotify-space-md);
      }
      
      .nav-link {
        padding: var(--spotify-space-xs) var(--spotify-space-sm);
        font-size: 0.75rem;
      }
      
      .nav-text {
        display: none;
      }
      
      .nav-icon {
        font-size: 1.2rem;
      }
      
      .main-content {
        padding: var(--spotify-space-lg) var(--spotify-space-md);
      }
      
      .logo-text {
        font-size: 1.2rem;
      }
    }
    
    @media (max-width: 480px) {
      .logo-section {
        gap: var(--spotify-space-xs);
      }
      
      .logo-icon {
        font-size: 1.5rem;
      }
      
      .logo-text {
        font-size: 1rem;
      }
    }
  `]
})
export class App {
  constructor(private router: Router) {
    // Handle uncaught errors to prevent page refresh
    window.addEventListener('error', (event) => {
      console.error('Global error caught:', event.error);
      event.preventDefault(); // Prevent default browser error handling
      return false;
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      event.preventDefault(); // Prevent default browser error handling
    });
  }
  
  isActive(route: string): boolean {
    try {
      return this.router.url.startsWith(route);
    } catch (error) {
      console.error('Error checking active route:', error);
      return false;
    }
  }
}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
}).catch(err => {
  console.error('Bootstrap error:', err);
});