// filepath: /c:/Users/shubh/OneDrive/Desktop/BE shery/models/db.js
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // Remove deprecated options
    });
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error('Failed to connect to MongoDB Atlas', err);
    process.exit(1);
  }
};

module.exports = connectDB;