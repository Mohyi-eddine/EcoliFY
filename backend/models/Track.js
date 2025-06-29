const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  artist: {
    type: String,
    required: [true, 'Artist is required'],
    trim: true,
    maxlength: [100, 'Artist name cannot exceed 100 characters']
  },
  album: {
    type: String,
    default: '',
    trim: true,
    maxlength: [200, 'Album name cannot exceed 200 characters']
  },
  duration: {
    type: Number,
    default: 0,
    min: [0, 'Duration cannot be negative']
  },
  audioUrl: {
    type: String,
    required: [true, 'Audio URL is required']
  },
  fileSize: {
    type: Number,
    default: 0
  },
  mimeType: {
    type: String,
    default: 'audio/mpeg'
  },
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
trackSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add indexes for better query performance
trackSchema.index({ title: 1 });
trackSchema.index({ artist: 1 });
trackSchema.index({ createdAt: -1 });

// Virtual for formatted duration
trackSchema.virtual('formattedDuration').get(function() {
  const minutes = Math.floor(this.duration / 60);
  const seconds = Math.floor(this.duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Ensure virtual fields are serialized
trackSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Track', trackSchema);