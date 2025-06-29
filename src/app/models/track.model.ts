export interface Track {
  _id?: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  audioUrl: string;
  createdAt?: Date;
}