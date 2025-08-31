const express = require('express');
const router = express.Router();
const pool = require('../config/dbConfig');
const cors = require('cors');


router.use(cors());

// router.get('/',(req,res) => {
//   res.json("welcome");
// });




router.post('/', (req, res) => {
   const{userID} = req.body;
   
    const query = 'SELECT U.user_id, U.name AS user_name, U.role, D.dept_id, D.dept_name, P.Date_of_Joining AS joining_date, A.Admin_no AS admin_number FROM User U LEFT JOIN Professor P ON U.user_id = P.prof_id LEFT JOIN Admin A ON U.user_id = A.admin_id LEFT JOIN Department D ON U.dept_id = D.dept_id where user_id=?';

  pool.query(query, userID, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length >0) {
        return  res.status(200).json({success: true,message: "matched :",details: results});
         
      
    } else {
      // User not found, send error response
      return res.status(401).json({ success: false, message: 'no such registartion' });
    }
  });
});


module.exports = router;
