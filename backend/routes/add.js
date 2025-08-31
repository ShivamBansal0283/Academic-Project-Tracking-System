const express = require('express');
const router = express.Router();
const pool = require('../config/dbConfig');
const cors = require('cors');


router.use(cors());

// router.get('/',(req,res) => {
//   res.json("welcome");
// });



router.post('/', (req, res) => {
    const {
        userID,
        username,
        password,
        userType,
        departmentID,
    } = req.body;

    // Data validation
    if (!userID || !username || !password || !userType || !departmentID) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const query = 'INSERT INTO User (user_id, name, dept_id, password, role) VALUES (?, ?, ?, ?, ?)';
    const values = [userID, username, departmentID, password, userType];
    console.log(values);

    pool.query(query, values, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Successful insertion
        return res.status(200).json({ success: true, message: 'User added successfully' });
    });
});


module.exports = router;
