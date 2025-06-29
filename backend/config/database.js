const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('URI: mongodb://localhost:27017/musicapp');
    
    const conn = await mongoose.connect('mongodb://localhost:27017/musicapp');

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('Make sure MongoDB is running locally on port 27017');
      console.log('   Install MongoDB from: https://www.mongodb.com/try/download/community');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;