const mongoose = require('mongoose');
require('dotenv').config();

const checkMongoDB = async () => {
  try {
    console.log('🔍 Checking MongoDB connection...');
    console.log('📍 Connecting to: mongodb://localhost:27017/musicapp');
    
    const conn = await mongoose.connect('mongodb://localhost:27017/musicapp');
    
    console.log('✅ MongoDB connection successful!');
    console.log(`📊 Host: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`📊 Ready State: ${conn.connection.readyState}`);
    
    // Test basic operations
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`📊 Collections: ${collections.length}`);
    
    await mongoose.disconnect();
    console.log('✅ Test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 MongoDB n\'est pas démarré. Pour l\'installer :');
      console.log('');
      console.log('🪟 Windows:');
      console.log('   1. Télécharger: https://www.mongodb.com/try/download/community');
      console.log('   2. Installer avec les options par défaut');
      console.log('   3. MongoDB démarre automatiquement');
      console.log('');
      console.log('🍎 macOS:');
      console.log('   brew tap mongodb/brew');
      console.log('   brew install mongodb-community');
      console.log('   brew services start mongodb-community');
      console.log('');
      console.log('🐧 Linux (Ubuntu):');
      console.log('   wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -');
      console.log('   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list');
      console.log('   sudo apt-get update');
      console.log('   sudo apt-get install -y mongodb-org');
      console.log('   sudo systemctl start mongod');
    }
    
    process.exit(1);
  }
};

checkMongoDB();