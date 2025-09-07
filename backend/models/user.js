// File: backend/models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Every email must be unique
  },
  password: {
    type: String,
    required: true,
  },
}, { timestamps: true }); // Automatically adds 'createdAt' and 'updatedAt' fields

module.exports = mongoose.model('User', UserSchema);