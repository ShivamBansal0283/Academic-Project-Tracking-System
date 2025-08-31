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

  const query = 'SELECT P.project_id,P.project_title, P.course_id, T.team_id, AVG(E.Eval_score) AS average_marks FROM Project P INNER JOIN Team T ON P.project_id = T.project_id INNER JOIN Submission S ON T.team_id = S.team_id AND P.project_id = S.project_id INNER JOIN Evaluation E ON S.team_id = E.team_id AND S.task_id = E.task_id AND S.prof_id = E.prof_id AND S.project_id = E.project_id INNER JOIN Course C ON P.course_id = C.course_id INNER JOIN Teaches TC ON C.course_id = TC.course_id WHERE TC.prof_id = ?  GROUP BY P.project_id, P.project_title, P.course_id, T.team_id HAVING COUNT(DISTINCT S.task_id) = (SELECT COUNT(*) FROM Task WHERE project_id = P.project_id)';
//   const value = [department,status];
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
