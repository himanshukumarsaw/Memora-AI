const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    if (!uri) {
      console.log('⚡ No MONGODB_URI found. Starting in-memory MongoDB...');
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log(`✅ In-memory MongoDB started at: ${uri}`);
    }

    await mongoose.connect(uri, { dbName: 'memora_db' });
    console.log('✅ MongoDB connected: memora_db');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  if (mongod) await mongod.stop();
  console.log('MongoDB connection closed.');
  process.exit(0);
});

module.exports = connectDB;
