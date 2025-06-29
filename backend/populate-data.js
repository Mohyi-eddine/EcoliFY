const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Sample data to populate
const sampleTracks = [
  {
    _id: 'track1',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    duration: 355,
    audioUrl: '/uploads/sample1.mp3',
    createdAt: new Date('2024-01-15')
  },
  {
    _id: 'track2',
    title: 'Imagine',
    artist: 'John Lennon',
    album: 'Imagine',
    duration: 183,
    audioUrl: '/uploads/sample2.mp3',
    createdAt: new Date('2024-01-16')
  },
  {
    _id: 'track3',
    title: 'Hotel California',
    artist: 'Eagles',
    album: 'Hotel California',
    duration: 391,
    audioUrl: '/uploads/sample3.mp3',
    createdAt: new Date('2024-01-17')
  },
  {
    _id: 'track4',
    title: 'Stairway to Heaven',
    artist: 'Led Zeppelin',
    album: 'Led Zeppelin IV',
    duration: 482,
    audioUrl: '/uploads/sample4.mp3',
    createdAt: new Date('2024-01-18')
  },
  {
    _id: 'track5',
    title: 'Sweet Child O\' Mine',
    artist: 'Guns N\' Roses',
    album: 'Appetite for Destruction',
    duration: 356,
    audioUrl: '/uploads/sample5.mp3',
    createdAt: new Date('2024-01-19')
  }
];

const samplePlaylists = [
  {
    _id: 'playlist1',
    name: 'Classic Rock Hits',
    description: 'The best classic rock songs of all time',
    tracks: ['track1', 'track3', 'track4'],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    _id: 'playlist2',
    name: 'Peaceful Vibes',
    description: 'Relaxing songs for a peaceful mood',
    tracks: ['track2'],
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-21')
  },
  {
    _id: 'playlist3',
    name: 'Rock Anthems',
    description: 'Epic rock anthems that get you pumped',
    tracks: ['track4', 'track5'],
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22')
  }
];

module.exports = { sampleTracks, samplePlaylists };