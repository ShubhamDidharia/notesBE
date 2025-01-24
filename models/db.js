// filepath: /c:/Users/shubh/OneDrive/Desktop/BE shery/models/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://dummyuser:mongodb@cluster0.bydqx.mongodb.net/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error('Failed to connect to MongoDB Atlas', err);
    process.exit(1);
  }
};

module.exports = connectDB;