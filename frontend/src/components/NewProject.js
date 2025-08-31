import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom'; 
import '../css/NewProject.css';

const NewProject = () => {
  const { username } = useParams();
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects(username);
  }, [username]);

  const fetchProjects = async (username) => {
    try {
      const response = await axios.post('http://localhost:8080/newproject', {
        username,
      });
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleRowClick = (projectId) => {
    const projectToSend = projects.find(project => project.project_id === projectId);
    navigate(`${projectId}`);
  };

  return (
    <div className="new project">
      <h2 >New Projects</h2>
      <table >
        <thead>
          <tr>
            <th>Project ID</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project, index) => (
              <tr key={index} onClick={() => handleRowClick(project.project_id)}>
                <td>{project.project_id}</td>
                <td>{project.project_title}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default NewProject;
