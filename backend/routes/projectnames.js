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

  const query = 'select * from submission natural join task  natural join project where prof_id=10 and submission.task_id not in (select evaluation.task_id from evaluation where evaluation.prof_id)';
  pool.query(query,username, (err, results) => {
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
