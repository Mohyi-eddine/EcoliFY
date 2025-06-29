const Track = require('../models/Track');
const Playlist = require('../models/Playlist');

const sampleTracks = [
  {
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    duration: 355,
    audioUrl: '/uploads/sample1.mp3',
    mimeType: 'audio/mpeg'
  },
  {
    title: 'Imagine',
    artist: 'John Lennon',
    album: 'Imagine',
    duration: 183,
    audioUrl: '/uploads/sample2.mp3',
    mimeType: 'audio/mpeg'
  },
  {
    title: 'Hotel California',
    artist: 'Eagles',
    album: 'Hotel California',
    duration: 391,
    audioUrl: '/uploads/sample3.mp3',
    mimeType: 'audio/mpeg'
  },
  {
    title: 'Stairway to Heaven',
    artist: 'Led Zeppelin',
    album: 'Led Zeppelin IV',
    duration: 482,
    audioUrl: '/uploads/sample4.mp3',
    mimeType: 'audio/mpeg'
  },
  {
    title: 'Sweet Child O\' Mine',
    artist: 'Guns N\' Roses',
    album: 'Appetite for Destruction',
    duration: 356,
    audioUrl: '/uploads/sample5.mp3',
    mimeType: 'audio/mpeg'
  }
];

const seedDatabase = async () => {
  try {
    console.log('Seeding database with sample data...');
    
    // Check if tracks already exist
    const existingTracks = await Track.countDocuments();
    if (existingTracks > 0) {
      console.log('Database already has tracks, skipping seed');
      return;
    }

    // Create sample tracks
    console.log('Creating sample tracks...');
    const createdTracks = await Track.insertMany(sampleTracks);
    console.log(`Created ${createdTracks.length} sample tracks`);

    // Create sample playlists
    console.log('Creating sample playlists...');
    const samplePlaylists = [
      {
        name: 'Classic Rock Hits',
        description: 'The best classic rock songs of all time',
        tracks: [createdTracks[0]._id, createdTracks[2]._id, createdTracks[3]._id]
      },
      {
        name: 'Peaceful Vibes',
        description: 'Relaxing songs for a peaceful mood',
        tracks: [createdTracks[1]._id]
      },
      {
        name: 'Rock Anthems',
        description: 'Epic rock anthems that get you pumped',
        tracks: [createdTracks[3]._id, createdTracks[4]._id]
      }
    ];

    const createdPlaylists = await Playlist.insertMany(samplePlaylists);
    console.log(`Created ${createdPlaylists.length} sample playlists`);
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = { seedDatabase };