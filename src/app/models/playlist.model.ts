import { Track } from './track.model';

export interface Playlist {
  _id?: string;
  name: string;
  description?: string;
  tracks: Track[];
  createdAt?: Date;
  updatedAt?: Date;
}