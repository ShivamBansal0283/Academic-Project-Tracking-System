const express = require('express');
const router = express.Router();
const pool = require('../config/dbConfig');
const cors = require('cors');


router.use(cors());

// router.get('/',(req,res) => {
//   res.json("welcome");
// });




router.post('/', (req, res) => {
    const { username,project} = req.body;
    const val='Not Submitted';
    const value = [val,username,project];
    console.log(value);
  
    const query = 'SELECT T.team_id, TS.task_id, TS.task_name, CASE WHEN S.status IS NULL THEN ? ELSE S.status END AS submit_status FROM Team T JOIN Team_Members TM ON T.team_id = TM.team_id JOIN Task TS ON T.project_id = TS.project_id LEFT JOIN Submission S ON TS.task_id = S.task_id AND T.team_id = S.team_id WHERE TM.member_id = ? AND T.project_id = ? ORDER BY T.team_id, TS.task_id'; // Adjust SQL query according to your database structure
    pool.query(query, value, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      if (results.length > 0) {
        return  res.status(200).json({success: true,message: "details are :",project: results});
      } else {
         return res.status(401).json({ message: 'Project information not found' });
      }
    });
  });


module.exports = router;