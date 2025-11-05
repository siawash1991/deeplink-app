/**
 * Database Configuration
 *
 * MongoDB connection setup and configuration
 *
 * @module config/database
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 *
 * @param {string} uri - MongoDB connection URI
 * @returns {Promise} Promise that resolves when connected
 */
async function connectDatabase(uri) {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB');
    console.log(`📍 Database: ${mongoose.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Close database connection
 *
 * @returns {Promise} Promise that resolves when disconnected
 */
async function closeDatabase() {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
}

module.exports = {
  connectDatabase,
  closeDatabase
};
