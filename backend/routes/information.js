const express = require('express');
const router = express.Router();
const pool = require('../config/dbConfig');
const cors = require('cors');


router.use(cors());

// router.get('/',(req,res) => {
//   res.json("welcome");
// });




router.post('/', (req, res) => {
    const { username } = req.body;
    console.log(username);
  const query = 'SELECT * FROM user WHERE user_id=?';
  pool.query(query, username, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length === 1) {
        return  res.status(200).json({success: true,message: "search details :",info: results});
         
      
    } else {
      // User not found, send error response
      return res.status(401).json({ success: false, message: 'no user found' });
    }
  });
});


module.exports = router;
