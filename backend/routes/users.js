const express = require('express');
const router = express.Router();
const pool = require('../config/dbConfig');
const cors = require('cors');


router.use(cors());

// router.get('/',(req,res) => {
//   res.json("welcome");
// });




router.post('/', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM user WHERE user_id = ? AND password = ?';
  pool.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length === 1) {
      const role = results[0].role;
      console.log(role);
      // Redirect to appropriate path based on role
      switch (role) {
        case 'student':
          return res.status(200).json({ success: true, role: 'student', message: 'Login successful'});
          break;
        case 'professor':
          return res.status(200).json({ success: true, role: 'professor', message: 'Login successful' });
          break;
        case 'admin':
          return res.status(200).json({ success: true, role: 'admin', message: 'Login successful' });
          break;
        default:
          return res.status(401).json({ success: false, error: 'Invalid role' });
      }
    } else {
      // User not found, send error response
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  });
});


module.exports = router;
