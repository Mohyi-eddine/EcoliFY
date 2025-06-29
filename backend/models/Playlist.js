const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Playlist name is required'],
    trim: true,
    maxlength: [100, 'Playlist name cannot exceed 100 characters']
  },
  description: {
    type: String,
    default: '',
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  tracks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
playlistSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add indexes
playlistSchema.index({ name: 1 });
playlistSchema.index({ createdAt: -1 });

// Virtual for track count
playlistSchema.virtual('trackCount').get(function() {
  return this.tracks.length;
});

// Virtual for total duration
playlistSchema.virtual('totalDuration').get(function() {
  if (!this.populated('tracks')) return 0;
  return this.tracks.reduce((total, track) => total + (track.duration || 0), 0);
});

// Ensure virtual fields are serialized
playlistSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Playlist', playlistSchema);