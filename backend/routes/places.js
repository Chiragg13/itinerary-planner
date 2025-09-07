// File: backend/routes/places.js

const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// Main city search endpoint
router.post('/', async (req, res) => {
    const { city } = req.body;
    if (!city) return res.status(400).json({ error: 'City is required' });
    try {
        const geocodeUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(city)}&apiKey=${GEOAPIFY_API_KEY}`;
        const geocodeResponse = await axios.get(geocodeUrl);
        if (geocodeResponse.data.features.length === 0) return res.status(404).json({ error: 'City not found' });
        const { lon, lat } = geocodeResponse.data.features[0].properties;

        const attractionsUrl = `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:${lon},${lat},20000&bias=proximity:${lon},${lat}&limit=20&apiKey=${GEOAPIFY_API_KEY}`;
        const restaurantsUrl = `https://api.geoapify.com/v2/places?categories=catering.restaurant&filter=circle:${lon},${lat},20000&bias=proximity:${lon},${lat}&limit=15&apiKey=${GEOAPIFY_API_KEY}`;
        const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
        
        const [attractionsResponse, restaurantsResponse, weatherResponse] = await Promise.all([
            axios.get(attractionsUrl), axios.get(restaurantsUrl), axios.get(weatherUrl)
        ]);
        
        const filteredPlaces = attractionsResponse.data.features.filter(p => p.properties && p.properties.name);
        const filteredRestaurants = restaurantsResponse.data.features.filter(p => p.properties && p.properties.name);
        
        const dailyForecasts = {};
        weatherResponse.data.list.forEach(forecast => {
            const date = forecast.dt_txt.split(' ')[0];
            if (!dailyForecasts[date]) {
                dailyForecasts[date] = {
                    temp: forecast.main.temp,
                    description: forecast.weather[0].description,
                    icon: forecast.weather[0].icon,
                };
            }
        });
        res.json({ city_coords: { lon, lat }, places: filteredPlaces, restaurants: filteredRestaurants, weather: Object.values(dailyForecasts).slice(0, 5) });
    } catch (error) {
        console.error(error); res.status(500).json({ error: 'Failed to fetch data' });
    }
});

// Nearby restaurants endpoint
router.post('/nearby-restaurants', async (req, res) => {
    const { lat, lon } = req.body;
    if (!lat || !lon) return res.status(400).json({ error: 'Latitude and Longitude are required' });
    try {
        const nearbyUrl = `https://api.geoapify.com/v2/places?categories=catering.restaurant&filter=circle:${lon},${lat},1000&bias=proximity:${lon},${lat}&limit=10&apiKey=${GEOAPIFY_API_KEY}`;
        const nearbyResponse = await axios.get(nearbyUrl);
        const filteredNearby = nearbyResponse.data.features.filter(p => p.properties && p.properties.name);
        res.json(filteredNearby);
    } catch (error) {
        console.error(error); res.status(500).json({ error: 'Failed to fetch nearby restaurants' });
    }
});

module.exports = router;