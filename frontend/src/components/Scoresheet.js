import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Scoresheet.css';
import { useParams } from 'react-router-dom';

function Scoresheet() {
    const { username } = useParams();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetching projects from backend
                const projectsResponse = await axios.post('http://localhost:8080/scoreprojects',{
                    username,
                });
                setProjects(projectsResponse.data.projects);
                console.log(projects);
                setLoading(false);
                setError('');
            } catch (error) {
                setError('Error fetching data.');
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    return (
        <div class="scoresheet">
            <h2>Scoresheet</h2>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            <table>
                <thead>
                    <tr>
                        <th>Project ID</th>
                        <th>Project Name</th>
                        <th>Team</th>
                        <th>Course</th>
                        <th>Marks</th>
                    </tr>
                </thead>
                <tbody>
                    {projects.map((project, index) => (
                        <tr key={index}>
                            <td>{project.project_id}</td>
                            <td>{project.project_title}</td>
                            <td>{project.team_id}</td>
                            <td>{project.course_id}</td>
                            <td>{project.average_marks}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Scoresheet;
