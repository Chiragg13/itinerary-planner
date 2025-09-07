// File: backend/routes/itineraries.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Import our auth middleware
const Itinerary = require('../models/Itinerary'); // Import the Itinerary model

// --- 1. Get User's Itineraries ---
// @route   GET /api/itineraries
// @desc    Get all itineraries for the logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Find all itineraries that belong to the user ID from the token
    const itineraries = await Itinerary.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(itineraries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- 2. Save a New Itinerary ---
// @route   POST /api/itineraries
// @desc    Save a new itinerary
// @access  Private
router.post('/', auth, async (req, res) => {
  const { cityName, city_coords, places, restaurants } = req.body;

  try {
    const newItinerary = new Itinerary({
      user: req.user.id, // Get the user ID from the auth middleware
      cityName,
      city_coords,
      places,
      restaurants,
    });

    const itinerary = await newItinerary.save();
    res.json(itinerary);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;