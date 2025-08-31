// useRoute.js

const express = require('express');
const router = express.Router();
const pool = require('../config/dbConfig');

// Define routes

// Example route to fetch data from database
router.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    pool.query(query, [username, password], (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      if (results.length === 1) {
        // User found, send success response
        res.status(200).json({ message: 'Login successful' });
      } else {
        // User not found, send error response
        res.status(401).json({ error: 'Invalid credentials' });
      }
    });
  });

module.exports = router;
