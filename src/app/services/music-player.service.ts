import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Track } from '../models/track.model';
import { Howl } from 'howler';

@Injectable({
  providedIn: 'root'
})
export class MusicPlayerService {
  private currentTrack = new BehaviorSubject<Track | null>(null);
  private isPlaying = new BehaviorSubject<boolean>(false);
  private currentTime = new BehaviorSubject<number>(0);
  private duration = new BehaviorSubject<number>(0);
  private volume = new BehaviorSubject<number>(1);

  private sound: Howl | null = null;
  private playlist: Track[] = [];
  private currentIndex = 0;
  private progressUpdateId: number | null = null;

  currentTrack$ = this.currentTrack.asObservable();
  isPlaying$ = this.isPlaying.asObservable();
  currentTime$ = this.currentTime.asObservable();
  duration$ = this.duration.asObservable();
  volume$ = this.volume.asObservable();

  playTrack(track: Track, playlist: Track[] = []) {
    console.log('🎵 Attempting to play track:', track.title);
    console.log('🔗 Audio URL:', track.audioUrl);
    
    // Stop any existing sound and clear progress updates
    this.stopProgressUpdate();
    if (this.sound) {
      this.sound.stop();
      this.sound.unload();
    }

    this.playlist = playlist;
    this.currentIndex = playlist.findIndex(t => t._id === track._id);
    
    // Construct full URL for audio
    const audioUrl = track.audioUrl.startsWith('http') 
      ? track.audioUrl 
      : `http://localhost:3000${track.audioUrl}`;
    
    console.log('🌐 Full audio URL:', audioUrl);
    
    this.sound = new Howl({
      src: [audioUrl],
      html5: true,
      format: ['mp3', 'wav', 'ogg', 'm4a'],
      volume: this.volume.value,
      preload: true,
      onload: () => {
        console.log('Audio loaded successfully');
        const duration = this.sound?.duration() || 0;
        this.duration.next(duration);
        console.log('Duration:', duration, 'seconds');
      },
      onloaderror: (id, error) => {
        console.error('Audio load error:', error);
        console.error('Failed URL:', audioUrl);
        this.handleError(`Erreur de chargement audio: ${error}`);
      },
      onplay: () => {
        console.log('Audio started playing');
        this.isPlaying.next(true);
        this.startProgressUpdate();
      },
      onpause: () => {
        console.log('Audio paused');
        this.isPlaying.next(false);
        this.stopProgressUpdate();
      },
      onstop: () => {
        console.log('Audio stopped');
        this.isPlaying.next(false);
        this.currentTime.next(0);
        this.stopProgressUpdate();
      },
      onend: () => {
        console.log('Audio ended, playing next');
        this.stopProgressUpdate();
        this.next();
      },
      onplayerror: (id, error) => {
        console.error('Audio play error:', error);
        this.handleError(`Erreur de lecture: ${error}`);
      }
    });

    this.currentTrack.next(track);
    
    // Try to play with error handling
    try {
      this.sound.play();
    } catch (error) {
      console.error('Play error:', error);
      this.handleError(`Impossible de jouer la track: ${error}`);
    }
  }

  play() {
    if (this.sound && !this.isPlaying.value) {
      console.log('Resuming playback');
      try {
        this.sound.play();
      } catch (error) {
        console.error('Resume play error:', error);
        this.handleError(`Erreur lors de la reprise: ${error}`);
      }
    }
  }

  pause() {
    if (this.sound && this.isPlaying.value) {
      console.log('Pausing playback');
      try {
        this.sound.pause();
      } catch (error) {
        console.error('Pause error:', error);
      }
    }
  }

  stop() {
    if (this.sound) {
      console.log('Stopping playback');
      try {
        this.sound.stop();
      } catch (error) {
        console.error('Stop error:', error);
      }
    }
  }

  next() {
    if (this.playlist.length > 0 && this.currentIndex < this.playlist.length - 1) {
      this.currentIndex++;
      console.log('Playing next track:', this.playlist[this.currentIndex].title);
      this.playTrack(this.playlist[this.currentIndex], this.playlist);
    } else {
      console.log('No next track available');
      this.stop();
    }
  }

  previous() {
    if (this.playlist.length > 0 && this.currentIndex > 0) {
      this.currentIndex--;
      console.log('Playing previous track:', this.playlist[this.currentIndex].title);
      this.playTrack(this.playlist[this.currentIndex], this.playlist);
    } else {
      console.log('No previous track available');
    }
  }

  seek(position: number) {
    if (this.sound) {
      try {
        console.log('Seeking to:', position, 'seconds');
        this.sound.seek(position);
        this.currentTime.next(position);
      } catch (error) {
        console.error('Seek error:', error);
      }
    }
  }

  setVolume(vol: number) {
    try {
      console.log('Setting volume to:', Math.round(vol * 100) + '%');
      this.volume.next(vol);
      if (this.sound) {
        this.sound.volume(vol);
      }
    } catch (error) {
      console.error('Volume error:', error);
    }
  }

  private startProgressUpdate() {
    this.stopProgressUpdate(); // Ensure no duplicate updates
    this.updateProgress();
  }

  private stopProgressUpdate() {
    if (this.progressUpdateId !== null) {
      cancelAnimationFrame(this.progressUpdateId);
      this.progressUpdateId = null;
    }
  }

  private updateProgress() {
    try {
      if (this.sound && this.isPlaying.value) {
        const currentTime = this.sound.seek() as number;
        if (typeof currentTime === 'number' && !isNaN(currentTime)) {
          this.currentTime.next(currentTime);
        }
        this.progressUpdateId = requestAnimationFrame(() => this.updateProgress());
      }
    } catch (error) {
      console.error('Progress update error:', error);
      this.stopProgressUpdate();
    }
  }

  private handleError(message: string) {
    console.error('Player error:', message);
    this.isPlaying.next(false);
    this.stopProgressUpdate();
    
    // Don't show alert immediately, just log the error
    // This prevents interrupting the user experience
    setTimeout(() => {
      if (confirm(`${message}\n\nVoulez-vous réessayer ?`)) {
        if (this.currentTrack.value) {
          this.playTrack(this.currentTrack.value, this.playlist);
        }
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Cleanup method to be called when service is destroyed
  cleanup() {
    this.stopProgressUpdate();
    if (this.sound) {
      this.sound.stop();
      this.sound.unload();
      this.sound = null;
    }
  }

  // Debug method to test audio URLs
  testAudioUrl(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const testSound = new Howl({
        src: [url],
        html5: true,
        onload: () => {
          console.log('Audio URL test successful:', url);
          testSound.unload();
          resolve(true);
        },
        onloaderror: (id, error) => {
          console.error('Audio URL test failed:', url, error);
          testSound.unload();
          resolve(false);
        }
      });
    });
  }
}