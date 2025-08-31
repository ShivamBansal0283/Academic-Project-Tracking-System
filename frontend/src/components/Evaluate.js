import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom'; 
import '../css/Evaluate.css';

const EvaluateComponent = () => {
  const { username } = useParams();
  const [selectedProjectName, setSelectedProjectName] = useState('');
  const [projectNames, setProjectNames] = useState([]);
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjectNames();
  }, []);

  const fetchProjectNames = async () => {
    try {
      const response = await axios.post('http://localhost:8080/projectnames', {
        username,
      },[]);
      setProjects(response.data.projects);
      const projectTitles = response.data.projects.map(project => project.project_title);
      setProjectNames(projectTitles);
      console.log(username);
    } catch (error) {
      console.error('Error fetching project names:', error);
    }
  };

  const handleFilter = () => {
    // Implement your filter logic here
  };

  const handleRowClick = (projectId) => {
    const projectToSend = projects.find(project => project.project_id === projectId);
    navigate(`${projectId}`, { state: { project: projectToSend } });
  };

  return (
    <div className="evaluate">
      <h2 className="evaluate-title">Evaluate</h2>
      <div className="filter-container">
        <select className="filter" value={selectedProjectName} onChange={(e) => setSelectedProjectName(e.target.value)}>
          <option value="">Select Project Name</option>
          {projectNames.map((projectName, index) => (
            <option key={index} value={projectName}>{projectName}</option>
          ))}
        </select>
        <button className="filter-button" onClick={handleFilter}>Filter</button>
      </div>
      <table className="evaluation-table">
        <thead>
          <tr>
            <th>team id</th>
            <th>Project ID</th>
            <th>Name</th>
            <th>Tasks</th>
          </tr>
        </thead>
        <tbody>
          {projects
            .filter(project => project.project_title === selectedProjectName || selectedProjectName === '')
            .map((project, index) => (
              <tr key={index} onClick={() => handleRowClick(project.project_id)}>
                <td>{project.team_id}</td>
                <td>{project.project_id}</td>
                <td>{project.project_title}</td>
                <td>{project.task_name}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default EvaluateComponent;
