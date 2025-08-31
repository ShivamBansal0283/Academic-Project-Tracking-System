// ActiveProjects.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../css/ActiveProject.css';

const ActiveProjects = () => {
  const { username } = useParams();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchActiveProjects = async () => {
      try {
        const response = await axios.post('http://localhost:8080/activeprojects', {
          username,
        });
        setProjects(response.data.projects);
      } catch (error) {
        console.error('Error fetching active projects:', error);
      }
    };

    fetchActiveProjects();
  }, []);

  return (
    <div className="active-projects">
      <h2>Active Projects</h2>
      <table>
        <thead>
          <tr>
            <th>Project ID</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project, index) => (
            <tr key={index}>
              <td>{project.project_id}</td>
              <td>
                <Link to={`/student/${username}/activeprojects/${project.project_id}`}>
                  {project.project_title}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActiveProjects;
