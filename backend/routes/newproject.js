const express = require('express');
const router = express.Router();
const pool = require('../config/dbConfig');
const cors = require('cors');


router.use(cors());

// router.get('/',(req,res) => {
//   res.json("welcome");
// });




router.post('/', (req, res) => {
  const {username} = req.body;
  console.log(username);

  const query = 'select * from project natural join department natural join course natural join user where user_id =? and project_id not in (select project_id from team_members where member_id=?)';
  const value = [username,username];
  pool.query(query,value, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length > 0) {
        return  res.status(200).json({success: true,message: "ongong projects are :",projects: results});
         
      
    } else {
      // User not found, send error response
      return res.status(401).json({ success: false, message: 'no projects ongoing' });
    }
  });
});


module.exports = router;
