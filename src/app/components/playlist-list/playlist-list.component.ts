import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Playlist } from '../../models/playlist.model';

@Component({
  selector: 'app-playlist-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './playlist-list.component.html',
  styleUrls: ['./playlist-list.component.css']
})
export class PlaylistListComponent implements OnInit {
  playlists: Playlist[] = [];
  loading = false;
  showCreateForm = false;

  newPlaylist = {
    name: '',
    description: ''
  };

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadPlaylists();
  }

  loadPlaylists() {
    this.loading = true;
    this.apiService.getPlaylists().subscribe({
      next: (playlists) => {
        this.playlists = playlists;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading playlists:', error);
        this.loading = false;
      }
    });
  }

  createPlaylist() {
    if (!this.newPlaylist.name.trim()) {
      return;
    }

    this.apiService.createPlaylist(this.newPlaylist).subscribe({
      next: (playlist) => {
        this.playlists.unshift(playlist);
        this.resetForm();
        this.showCreateForm = false;
      },
      error: (error) => {
        console.error('Error creating playlist:', error);
      }
    });
  }

  deletePlaylist(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette playlist ?')) {
      this.apiService.deletePlaylist(id).subscribe({
        next: () => {
          this.playlists = this.playlists.filter(playlist => playlist._id !== id);
        },
        error: (error) => {
          console.error('Error deleting playlist:', error);
        }
      });
    }
  }

  resetForm() {
    this.newPlaylist = {
      name: '',
      description: ''
    };
  }
}