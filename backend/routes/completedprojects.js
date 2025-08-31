const express = require('express');
const router = express.Router();
const pool = require('../config/dbConfig');
const cors = require('cors');


router.use(cors());

// router.get('/',(req,res) => {
//   res.json("welcome");
// });




router.post('/', (req, res) => {
  const status='Complete';
  const {username} = req.body;
  console.log(username);

  const query = 'SELECT P.project_id, P.project_title, AVG(E.Eval_score) AS project_score, GROUP_CONCAT(E.Feedback) AS project_feedback FROM Project P JOIN Team T ON P.project_id = T.project_id JOIN Team_Members TM ON T.team_id = TM.team_id JOIN Task TS ON T.project_id = TS.project_id LEFT JOIN Submission S ON TS.task_id = S.task_id AND T.team_id = S.team_id LEFT JOIN Evaluation E ON T.team_id = E.team_id AND TS.task_id = E.task_id WHERE TM.member_id = ? GROUP BY P.project_id, P.project_title HAVING COUNT(TS.task_id) = COUNT(S.task_id) AND COUNT(S.task_id) > 0';
  const value = [username];
  pool.query(query, value, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length === 1) {
        return  res.status(200).json({success: true,message: "copleted projects are :",projects: results});
         
      
    } else {
      // User not found, send error response
      return res.status(401).json({ success: false, message: 'no projects completed' });
    }
  });
});


module.exports = router;