import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MusicPlayerService } from '../../services/music-player.service';
import { Track } from '../../models/track.model';

@Component({
  selector: 'app-music-player-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './music-player-bar.component.html',
  styleUrls: ['./music-player-bar.component.css']
})
export class MusicPlayerBarComponent implements OnInit, OnDestroy {
  currentTrack: Track | null = null;
  isPlaying = false;
  currentTime = 0;
  duration = 0;
  volume = 1;
  showVolumeSlider = false;
  
  Math = Math; // Make Math accessible in template

  private subscriptions: Subscription[] = [];

  constructor(private playerService: MusicPlayerService) {}

  ngOnInit() {
    try {
      this.subscriptions.push(
        this.playerService.currentTrack$.subscribe(track => {
          this.currentTrack = track;
        }),
        
        this.playerService.isPlaying$.subscribe(playing => {
          this.isPlaying = playing;
        }),
        
        this.playerService.currentTime$.subscribe(time => {
          if (typeof time === 'number' && !isNaN(time)) {
            this.currentTime = time;
          }
        }),
        
        this.playerService.duration$.subscribe(duration => {
          if (typeof duration === 'number' && !isNaN(duration)) {
            this.duration = duration;
          }
        }),
        
        this.playerService.volume$.subscribe(volume => {
          if (typeof volume === 'number' && !isNaN(volume)) {
            this.volume = volume;
          }
        })
      );
    } catch (error) {
      console.error('❌ Error initializing player bar:', error);
    }
  }

  ngOnDestroy() {
    try {
      this.subscriptions.forEach(sub => sub.unsubscribe());
      this.subscriptions = [];
    } catch (error) {
      console.error('❌ Error destroying player bar:', error);
    }
  }

  togglePlayPause() {
    try {
      if (this.isPlaying) {
        this.playerService.pause();
      } else {
        this.playerService.play();
      }
    } catch (error) {
      console.error('❌ Error toggling play/pause:', error);
    }
  }

  stop() {
    try {
      this.playerService.stop();
    } catch (error) {
      console.error('❌ Error stopping:', error);
    }
  }

  previous() {
    try {
      this.playerService.previous();
    } catch (error) {
      console.error('❌ Error going to previous:', error);
    }
  }

  next() {
    try {
      this.playerService.next();
    } catch (error) {
      console.error('❌ Error going to next:', error);
    }
  }

  onSeek(event: any) {
    try {
      const target = event.target as HTMLInputElement;
      const value = parseFloat(target.value);
      if (!isNaN(value) && this.duration > 0) {
        const seekTime = (value / 100) * this.duration;
        this.playerService.seek(seekTime);
      }
    } catch (error) {
      console.error('❌ Error seeking:', error);
    }
  }

  onVolumeChange(event: any) {
    try {
      const target = event.target as HTMLInputElement;
      const value = parseFloat(target.value);
      if (!isNaN(value)) {
        const newVolume = value / 100;
        this.playerService.setVolume(newVolume);
      }
    } catch (error) {
      console.error('❌ Error changing volume:', error);
    }
  }

  toggleVolumeSlider() {
    try {
      this.showVolumeSlider = !this.showVolumeSlider;
    } catch (error) {
      console.error('❌ Error toggling volume slider:', error);
    }
  }

  getProgressPercentage(): number {
    try {
      if (this.duration === 0 || !this.duration || isNaN(this.duration)) return 0;
      if (!this.currentTime || isNaN(this.currentTime)) return 0;
      const percentage = (this.currentTime / this.duration) * 100;
      return Math.min(Math.max(percentage, 0), 100); // Clamp between 0 and 100
    } catch (error) {
      console.error('❌ Error calculating progress:', error);
      return 0;
    }
  }

  getVolumePercentage(): number {
    try {
      if (!this.volume || isNaN(this.volume)) return 100;
      return Math.min(Math.max(this.volume * 100, 0), 100); // Clamp between 0 and 100
    } catch (error) {
      console.error('❌ Error calculating volume:', error);
      return 100;
    }
  }

  formatTime(seconds: number): string {
    try {
      return this.playerService.formatTime(seconds);
    } catch (error) {
      console.error('❌ Error formatting time:', error);
      return '0:00';
    }
  }

  getVolumeIcon(): string {
    try {
      if (this.volume === 0) return '🔇';
      if (this.volume < 0.3) return '🔈';
      if (this.volume < 0.7) return '🔉';
      return '🔊';
    } catch (error) {
      console.error('❌ Error getting volume icon:', error);
      return '🔊';
    }
  }
}