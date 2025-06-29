import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { MusicPlayerService } from '../../services/music-player.service';
import { Playlist } from '../../models/playlist.model';
import { Track } from '../../models/track.model';

@Component({
  selector: 'app-playlist-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './playlist-detail.component.html',
  styleUrls: ['./playlist-detail.component.css']
})
export class PlaylistDetailComponent implements OnInit {
  playlist: Playlist | null = null;
  availableTracks: Track[] = [];
  loading = false;
  showAddTracks = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private apiService: ApiService,
    private playerService: MusicPlayerService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadPlaylist(id);
      this.loadAvailableTracks();
    }
  }

  loadPlaylist(id: string) {
    this.loading = true;
    this.apiService.getPlaylists().subscribe({
      next: (playlists) => {
        this.playlist = playlists.find(p => p._id === id) || null;
        this.loading = false;
        if (!this.playlist) {
          this.router.navigate(['/playlists']);
        }
      },
      error: (error) => {
        console.error('Error loading playlist:', error);
        this.loading = false;
        this.router.navigate(['/playlists']);
      }
    });
  }

  loadAvailableTracks() {
    this.apiService.getTracks().subscribe({
      next: (tracks) => {
        this.availableTracks = tracks;
      },
      error: (error) => {
        console.error('Error loading tracks:', error);
      }
    });
  }

  playTrack(track: Track) {
    if (this.playlist) {
      this.playerService.playTrack(track, this.playlist.tracks);
    }
  }

  playPlaylist() {
    if (this.playlist && this.playlist.tracks.length > 0) {
      this.playerService.playTrack(this.playlist.tracks[0], this.playlist.tracks);
    }
  }

  addTrackToPlaylist(track: Track) {
    if (this.playlist && track._id) {
      this.apiService.addTrackToPlaylist(this.playlist._id!, track._id).subscribe({
        next: (updatedPlaylist) => {
          this.playlist = updatedPlaylist;
        },
        error: (error) => {
          console.error('Error adding track to playlist:', error);
        }
      });
    }
  }

  removeTrackFromPlaylist(track: Track) {
    if (this.playlist && track._id && confirm('Retirer cette track de la playlist ?')) {
      this.apiService.removeTrackFromPlaylist(this.playlist._id!, track._id).subscribe({
        next: (updatedPlaylist) => {
          this.playlist = updatedPlaylist;
        },
        error: (error) => {
          console.error('Error removing track from playlist:', error);
        }
      });
    }
  }

  getAvailableTracksNotInPlaylist(): Track[] {
    if (!this.playlist) return this.availableTracks;
    
    const playlistTrackIds = this.playlist.tracks.map(t => t._id);
    return this.availableTracks.filter(track => !playlistTrackIds.includes(track._id));
  }

  formatDuration(seconds: number): string {
    return this.playerService.formatTime(seconds);
  }
}