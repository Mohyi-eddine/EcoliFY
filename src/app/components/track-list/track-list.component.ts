import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { MusicPlayerService } from '../../services/music-player.service';
import { Track } from '../../models/track.model';

@Component({
  selector: 'app-track-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './track-list.component.html',
  styleUrls: ['./track-list.component.css']
})
export class TrackListComponent implements OnInit {
  tracks: Track[] = [];
  loading = false;
  showAddForm = false;
  selectedFile: File | null = null;

  newTrack = {
    title: '',
    artist: '',
    album: '',
    duration: 0
  };

  constructor(
    private apiService: ApiService,
    private playerService: MusicPlayerService
  ) {}

  ngOnInit() {
    this.loadTracks();
  }

  loadTracks() {
    this.loading = true;
    this.apiService.getTracks().subscribe({
      next: (tracks) => {
        console.log('📥 Loaded tracks:', tracks.length);
        this.tracks = tracks;
        this.loading = false;
        
        // Debug: Log first few tracks
        tracks.slice(0, 3).forEach(track => {
          console.log(`🎵 Track: ${track.title} - URL: ${track.audioUrl}`);
        });
      },
      error: (error) => {
        console.error('Error loading tracks:', error);
        this.loading = false;
        alert('Erreur lors du chargement des tracks');
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      console.log('📁 File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
      this.selectedFile = file;
      
      // Auto-fill duration if possible (for demo purposes)
      if (!this.newTrack.duration) {
        this.newTrack.duration = 180; // Default 3 minutes
      }
    }
  }

  addTrack() {
    if (!this.selectedFile || !this.newTrack.title.trim() || !this.newTrack.artist.trim()) {
      alert('Veuillez remplir tous les champs obligatoires et sélectionner un fichier audio');
      return;
    }

    console.log('📤 Uploading track:', this.newTrack.title);

    const formData = new FormData();
    formData.append('audioFile', this.selectedFile);
    formData.append('title', this.newTrack.title.trim());
    formData.append('artist', this.newTrack.artist.trim());
    formData.append('album', this.newTrack.album.trim());
    formData.append('duration', this.newTrack.duration.toString());

    this.loading = true;

    this.apiService.addTrack(formData).subscribe({
      next: (track) => {
        console.log('Track uploaded successfully:', track);
        this.tracks.unshift(track);
        this.resetForm();
        this.showAddForm = false;
        this.loading = false;
        alert(`Track "${track.title}" ajoutée avec succès !`);
      },
      error: (error) => {
        console.error('Error uploading track:', error);
        this.loading = false;
        alert(`Erreur lors de l'ajout de la track: ${error.error?.error || error.message}`);
      }
    });
  }

  deleteTrack(id: string) {
    const track = this.tracks.find(t => t._id === id);
    if (track && confirm(`Êtes-vous sûr de vouloir supprimer "${track.title}" ?`)) {
      console.log('🗑️ Deleting track:', track.title);
      
      this.apiService.deleteTrack(id).subscribe({
        next: () => {
          this.tracks = this.tracks.filter(track => track._id !== id);
          console.log('Track deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting track:', error);
          alert('Erreur lors de la suppression de la track');
        }
      });
    }
  }

  async playTrack(track: Track) {
    console.log('🎵 Play button clicked for:', track.title);
    console.log('🔗 Track audio URL:', track.audioUrl);
    
    // Test the audio URL first
    const fullUrl = track.audioUrl.startsWith('http') 
      ? track.audioUrl 
      : `http://localhost:3000${track.audioUrl}`;
    
    console.log('Testing audio URL:', fullUrl);
    
    try {
      // Test if URL is accessible
      const response = await fetch(fullUrl, { method: 'HEAD' });
      if (!response.ok) {
        console.error('Audio file not accessible:', response.status, response.statusText);
        alert(`Fichier audio non accessible (${response.status}). Vérifiez que le serveur backend est démarré.`);
        return;
      }
      console.log('Audio file is accessible');
    } catch (error) {
      console.error('Network error accessing audio:', error);
      alert('Erreur réseau. Vérifiez que le serveur backend est démarré sur le port 3000.');
      return;
    }
    
    // Play the track
    this.playerService.playTrack(track, this.tracks);
  }

  resetForm() {
    this.newTrack = {
      title: '',
      artist: '',
      album: '',
      duration: 0
    };
    this.selectedFile = null;
    
    // Reset file input
    const fileInput = document.getElementById('audioFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  formatDuration(seconds: number): string {
    return this.playerService.formatTime(seconds);
  }

  // Debug method to test all track URLs
  async testAllTrackUrls() {
    console.log('Testing all track URLs...');
    for (const track of this.tracks) {
      const fullUrl = track.audioUrl.startsWith('http') 
        ? track.audioUrl 
        : `http://localhost:3000${track.audioUrl}`;
      
      try {
        const response = await fetch(fullUrl, { method: 'HEAD' });
        console.log(`${response.ok ? '✅' : '❌'} ${track.title}: ${response.status}`);
      } catch (error) {
        console.log(`❌ ${track.title}: Network error`);
      }
    }
  }
}