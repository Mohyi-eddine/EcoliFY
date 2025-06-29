import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Track } from '../models/track.model';
import { Playlist } from '../models/playlist.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Track methods
  getTracks(): Observable<Track[]> {
    return this.http.get<Track[]>(`${this.baseUrl}/tracks`);
  }

  addTrack(formData: FormData): Observable<Track> {
    return this.http.post<Track>(`${this.baseUrl}/tracks`, formData);
  }

  deleteTrack(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/tracks/${id}`);
  }

  // Playlist methods
  getPlaylists(): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(`${this.baseUrl}/playlists`);
  }

  createPlaylist(playlist: Partial<Playlist>): Observable<Playlist> {
    return this.http.post<Playlist>(`${this.baseUrl}/playlists`, playlist);
  }

  addTrackToPlaylist(playlistId: string, trackId: string): Observable<Playlist> {
    return this.http.post<Playlist>(`${this.baseUrl}/playlists/${playlistId}/tracks`, { trackId });
  }

  removeTrackFromPlaylist(playlistId: string, trackId: string): Observable<Playlist> {
    return this.http.delete<Playlist>(`${this.baseUrl}/playlists/${playlistId}/tracks/${trackId}`);
  }

  deletePlaylist(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/playlists/${id}`);
  }
}