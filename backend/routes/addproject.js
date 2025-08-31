const express = require('express');
const router = express.Router();
const pool = require('../config/dbConfig');
const cors = require('cors');

router.use(cors());

router.post('/', (req, res) => {
    const { projectId, projectTitle, course, projectDeadline, tasks } = req.body;

    const projectQuery = 'INSERT INTO Project(project_id, project_title, course_id, deadline) VALUES (?, ?, ?, ?)';
    const taskQuery = 'INSERT INTO Task (project_id, task_id, task_name, t_deadline) VALUES (?, ?, ?, ?)';

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return res.status(500).json({ success: false });
        }

        connection.beginTransaction((err) => {
            if (err) {
                console.error('Error starting transaction:', err);
                connection.release();
                return res.status(500).json({ success: false });
            }

            connection.query(projectQuery, [projectId, projectTitle, course, projectDeadline], (err, result) => {
                if (err) {
                    console.error('Error inserting project:', err);
                    connection.rollback(() => {
                        connection.release();
                        return res.status(500).json({ success: false });
                    });
                }

                

                tasks.forEach(task => {
                    connection.query(taskQuery, [projectId, task.taskId, task.taskName, task.taskDeadline], (err) => {
                        if (err) {
                            console.error('Error inserting task:', err);
                            connection.rollback(() => {
                                connection.release();
                                return res.status(500).json({ success: false });
                            });
                        }
                    });
                });

                connection.commit((err) => {
                    if (err) {
                        console.error('Error committing transaction:', err);
                        connection.rollback(() => {
                            connection.release();
                            return res.status(500).json({ success: false });
                        });
                    }

                    connection.release();
                    return res.status(200).json({ success: true });
                });
            });
        });
    });
});

module.exports = router;
