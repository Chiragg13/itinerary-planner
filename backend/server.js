// File: backend/server.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Define Routes
app.use('/api/places', require('./routes/places'));
app.use('/api/users', require('./routes/users'));
app.use('/api/itineraries', require('./routes/itineraries')); // Add the new itinerary routes

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});