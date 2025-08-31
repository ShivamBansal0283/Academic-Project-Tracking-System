const express = require('express');
const router = express.Router();
const pool = require('../config/dbConfig');
const cors = require('cors');


router.use(cors());

// router.get('/',(req,res) => {
//   res.json("welcome");
// });




app.post('/createTeam', (req, res) => {
    const { team_id, member_ids, project_id } = req.body;
  
    // Store the team in the database (or perform any other necessary operations)
    teams.push({
      team_id,
      project_id,
      member_ids
    });
  
    // Generate INSERT statements for team members and insert them into team_members table
    const insertStatements = member_ids.map(member_id => `INSERT INTO team_members (team_id,project_id, member_id) VALUES (${team_id}, ${project_id},${member_id});`);
    teamMembers.push(...insertStatements);
  
    // Send response
    res.status(201).json({ team_id });
  });
  



module.exports = router;
