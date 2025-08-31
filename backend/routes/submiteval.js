const express = require('express');
const router = express.Router();
const pool = require('../config/dbConfig');
const cors = require('cors');


router.use(cors());

// router.get('/',(req,res) => {
//   res.json("welcome");
// });




router.post('/', (req, res) => {
    const { project, marks, feedback } = req.body;
    const task_id = project.task_id;
    const team_id = project.team_id;
    const project_id = project.project_id;
    const prof_id = project.prof_id;
    const value = [team_id, task_id, prof_id, project_id, marks, feedback];

    const query = 'INSERT INTO evaluation(team_id, task_id, project_id, prof_id, Eval_score, Feedback) VALUES (?, ?, ?, ?, ?, ?)';

    pool.query(query, value, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ success: false, error: 'Internal Server Error' });
        }

        if (results.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'Evaluation submitted successfully' });
        } else {
            return res.status(401).json({ success: false, message: 'Failed to submit evaluation' });
        }
    });
});



module.exports = router;
