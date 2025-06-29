const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import database connection and models
const connectDB = require('./config/database');
const Track = require('./models/Track');
const Playlist = require('./models/Playlist');
const { seedDatabase } = require('./seed/sampleData');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB().then(() => {
  // Seed database with sample data if empty
  seedDatabase();
});

// Middleware
app.use(cors({
  origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
  credentials: true
}));
app.use(express.json());

// Serve uploads from backend/uploads directory only
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, path) => {
    // Set proper MIME types for audio files
    if (path.endsWith('.mp3')) {
      res.setHeader('Content-Type', 'audio/mpeg');
    } else if (path.endsWith('.wav')) {
      res.setHeader('Content-Type', 'audio/wav');
    } else if (path.endsWith('.ogg')) {
      res.setHeader('Content-Type', 'audio/ogg');
    } else if (path.endsWith('.m4a')) {
      res.setHeader('Content-Type', 'audio/mp4');
    }
    // Enable range requests for audio streaming
    res.setHeader('Accept-Ranges', 'bytes');
  }
}));

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Created directory: ${uploadsDir}`);
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, uniqueSuffix + extension);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('File upload attempt:', file.originalname, 'Type:', file.mimetype);
    
    const allowedMimes = [
      'audio/mpeg',
      'audio/mp3', 
      'audio/wav',
      'audio/ogg',
      'audio/m4a',
      'audio/aac',
      'audio/x-m4a'
    ];
    
    const allowedExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      console.log('File type accepted');
      cb(null, true);
    } else {
      console.log('File type rejected:', file.mimetype, fileExtension);
      cb(new Error(`Type de fichier non supporté. Types acceptés: ${allowedExtensions.join(', ')}`), false);
    }
  }
});

// Routes

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const trackCount = await Track.countDocuments();
    const playlistCount = await Playlist.countDocuments();
    
    res.json({ 
      status: 'OK', 
      tracks: trackCount, 
      playlists: playlistCount,
      uploadsDir: uploadsDir,
      database: 'MongoDB Local',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get all tracks
app.get('/api/tracks', async (req, res) => {
  try {
    console.log('Fetching tracks from MongoDB...');
    const tracks = await Track.find().sort({ createdAt: -1 });
    console.log(`Sending ${tracks.length} tracks`);
    res.json(tracks);
  } catch (error) {
    console.error('Error getting tracks:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a new track
app.post('/api/tracks', upload.single('audioFile'), async (req, res) => {
  try {
    console.log('New track upload request');
    console.log('Body:', req.body);
    console.log('File:', req.file ? req.file.filename : 'No file');

    const { title, artist, album, duration } = req.body;
    const audioUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title || !artist) {
      return res.status(400).json({ error: 'Title and artist are required' });
    }

    if (!audioUrl) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    // Verify file exists
    const filePath = path.join(uploadsDir, req.file.filename);
    if (!fs.existsSync(filePath)) {
      console.error('Uploaded file not found:', filePath);
      return res.status(500).json({ error: 'File upload failed' });
    }

    const fileStats = fs.statSync(filePath);
    console.log(`File stats: ${fileStats.size} bytes`);

    // Create new track in MongoDB
    const track = new Track({
      title: title.trim(),
      artist: artist.trim(),
      album: album ? album.trim() : '',
      duration: parseInt(duration) || 0,
      audioUrl,
      fileSize: fileStats.size,
      mimeType: req.file.mimetype
    });

    const savedTrack = await track.save();
    console.log(`Added new track to MongoDB: ${savedTrack.title} by ${savedTrack.artist}`);
    console.log(`Audio URL: ${savedTrack.audioUrl}`);
    
    res.status(201).json(savedTrack);
  } catch (error) {
    console.error('Error adding track:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete a track
app.delete('/api/tracks/:id', async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    // Delete file from uploads directory (but not sample files)
    if (track.audioUrl && !track.audioUrl.includes('sample')) {
      const filename = path.basename(track.audioUrl);
      const filePath = path.join(uploadsDir, filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted file: ${filePath}`);
      }
    }

    // Remove track from all playlists
    await Playlist.updateMany(
      { tracks: req.params.id },
      { $pull: { tracks: req.params.id } }
    );

    // Delete track from MongoDB
    await Track.findByIdAndDelete(req.params.id);
    console.log(`Deleted track from MongoDB: ${track.title}`);
    res.json({ message: 'Track deleted successfully' });
  } catch (error) {
    console.error('Error deleting track:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all playlists
app.get('/api/playlists', async (req, res) => {
  try {
    console.log('Fetching playlists from MongoDB...');
    const playlists = await Playlist.find()
      .populate('tracks')
      .sort({ createdAt: -1 });
    
    console.log(`Sending ${playlists.length} playlists`);
    res.json(playlists);
  } catch (error) {
    console.error('Error loading playlists:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new playlist
app.post('/api/playlists', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Playlist name is required' });
    }
    
    const playlist = new Playlist({
      name: name.trim(),
      description: description ? description.trim() : ''
    });

    const savedPlaylist = await playlist.save();
    console.log(`Created playlist in MongoDB: ${savedPlaylist.name}`);
    res.status(201).json(savedPlaylist);
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(400).json({ error: error.message });
  }
});

// Add track to playlist
app.post('/api/playlists/:id/tracks', async (req, res) => {
  try {
    const { trackId } = req.body;
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Check if track exists
    const track = await Track.findById(trackId);
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }
    
    // Add track if not already in playlist
    if (!playlist.tracks.includes(trackId)) {
      playlist.tracks.push(trackId);
      await playlist.save();
      console.log(`Added track to playlist: ${playlist.name}`);
    }

    // Return populated playlist
    const populatedPlaylist = await Playlist.findById(playlist._id).populate('tracks');
    res.json(populatedPlaylist);
  } catch (error) {
    console.error('Error adding track to playlist:', error);
    res.status(400).json({ error: error.message });
  }
});

// Remove track from playlist
app.delete('/api/playlists/:id/tracks/:trackId', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Remove track from playlist
    playlist.tracks = playlist.tracks.filter(trackId => trackId.toString() !== req.params.trackId);
    await playlist.save();

    // Return populated playlist
    const populatedPlaylist = await Playlist.findById(playlist._id).populate('tracks');
    console.log(`Removed track from playlist: ${playlist.name}`);
    res.json(populatedPlaylist);
  } catch (error) {
    console.error('Error removing track from playlist:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete playlist
app.delete('/api/playlists/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findByIdAndDelete(req.params.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    
    console.log(`Deleted playlist from MongoDB: ${playlist.name}`);
    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to list files in uploads directory
app.get('/api/debug/files', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir).map(filename => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        size: stats.size,
        created: stats.birthtime,
        url: `/uploads/${filename}`
      };
    });
    
    res.json({
      uploadsDir,
      files,
      totalFiles: files.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint for database stats
app.get('/api/debug/database', async (req, res) => {
  try {
    const trackCount = await Track.countDocuments();
    const playlistCount = await Playlist.countDocuments();
    const recentTracks = await Track.find().sort({ createdAt: -1 }).limit(5);
    const recentPlaylists = await Playlist.find().sort({ createdAt: -1 }).limit(3);
    
    res.json({
      database: 'MongoDB Local',
      collections: {
        tracks: trackCount,
        playlists: playlistCount
      },
      recentTracks: recentTracks.map(t => ({ title: t.title, artist: t.artist, createdAt: t.createdAt })),
      recentPlaylists: recentPlaylists.map(p => ({ name: p.name, trackCount: p.tracks.length, createdAt: p.createdAt }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Check if uploads directory has files
  try {
    const files = fs.readdirSync(uploadsDir);
    console.log(`📁 Files in uploads: ${files.length}`);
    files.forEach(file => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      console.log(`   - ${file} (${stats.size} bytes)`);
    });
  } catch (error) {
    console.log('No files in uploads directory yet');
  }
});