const mongoose = require('mongoose');
const { MONGODB_URI } = require('./environment');

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
      try {
        await mongoose.connection.db.collection('users').dropIndex('email_1');
      } catch (e) {
        // Index might not exist or collection not created yet, safe to ignore
      }
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
