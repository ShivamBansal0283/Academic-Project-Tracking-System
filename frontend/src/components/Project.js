// Project.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../css/Project.css';

function Project() {
    const [projectInfo, setProjectInfo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { username, project } = useParams();

    useEffect(() => {
        async function fetchProjectInfo() {
            try {
                // Assuming you have an endpoint to fetch project information
                const response = await axios.post('http://localhost:8080/project', {
                    username,
                    project,
                });
                setProjectInfo(response.data.project);
                setLoading(false);
                setError('');
            } catch (error) {
                setError('Error fetching project information.');
                setLoading(false);
            }
        }

        fetchProjectInfo();
    }, []);

    const handleUploadClick = async (taskName, taskId) => {
        try {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'application/pdf'; // Adjust accepted file types as needed
            fileInput.click();
            fileInput.onchange = async (e) => {
                const file = e.target.files[0];
                const formData = new FormData();
                formData.append('file', file);
                formData.append('taskId', taskId); // Sending task ID to backend
                formData.append('teamId', projectInfo[0].team_id); // Sending team ID to backend
                const response = await axios.post('http://localhost:8080/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                console.log('File uploaded successfully:', response.data);
                // You can perform additional actions here upon successful upload, such as updating UI or state.
            };
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    return (
        <div className='project'>
            <h2>Project Information</h2>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            <h3>Tasks</h3>
            <table>
                <thead>
                    <tr>
                        <th>Task Name</th>
                        <th>Submit Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {projectInfo && projectInfo.map((task, index) => (
                        <tr key={index}>
                            <td>{task.task_name}</td>
                            <td>{task.submit_status}</td>
                            <td>
                                {task.submit_status === 'Not Submitted' && (
                                    <button onClick={() => handleUploadClick(task.task_name, task.task_id)}>Upload</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Project;
