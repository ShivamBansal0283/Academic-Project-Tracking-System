const express = require('express');
const router = express.Router();
const pool = require('../config/dbConfig');
const cors = require('cors');

router.use(cors());

router.post('/', (req, res) => {
    const { team_id, team_name, project_id, member_ids } = req.body;

    // Ensure member_ids is an array
    if (!Array.isArray(member_ids)) {
        return res.status(400).json({ error: 'member_ids should be an array' });
    }

    // Construct the SQL query to insert into Team table
    const query = `INSERT INTO Team (team_id, team_name, project_id) VALUES (?, ?, ?);`;
    const values = [team_id, team_name, project_id];

    // Execute the query
    pool.query(query, values, (err, results) => {
        if (err) {
            console.error('Error creating team:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Insert team members
        const memberQuery = `INSERT INTO team_members (team_id, project_id, member_id) VALUES ?`;
        const memberValues = member_ids.map(member_id => [team_id, project_id, member_id]);

        // Execute the member insertion query
        pool.query(memberQuery, [memberValues], (err, results) => {
            if (err) {
                console.error('Error adding team members:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            // Send the team ID back to the client along with success response
            return res.status(200).json({ success: true, team_id: team_id });
        });
    });
});

module.exports = router;
