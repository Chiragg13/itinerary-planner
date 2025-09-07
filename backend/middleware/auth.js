// File: backend/middleware/auth.js

const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function (req, res, next) {
  // Get token from the header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Add the user payload to the request object
    next(); // Move on to the next function
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};