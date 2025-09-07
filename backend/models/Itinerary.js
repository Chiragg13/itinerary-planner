// File: backend/models/Itinerary.js

const mongoose = require('mongoose');

const ItinerarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // This links the itinerary to a User ID
    ref: 'User', // The model to link to
    required: true,
  },
  cityName: {
    type: String,
    required: true,
  },
  city_coords: {
    type: Object,
    required: true,
  },
  places: {
    type: [Object], // An array of place objects
    required: true,
  },
  restaurants: {
    type: [Object], // An array of restaurant objects
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Itinerary', ItinerarySchema);