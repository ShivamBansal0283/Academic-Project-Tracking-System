// ActiveProjects.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../css/CompletedProject.css';

const CompletedProjects = () => {
  const { username } = useParams();
//   const [activeProjects, setActiveProjects] = useState('');
  var [projects, setProjects] = useState([]);

  useEffect(() => {
    // Function to fetch active projects from backend
    const fetchActiveProjects = async () => {
      try {
        const response = await axios.post('http://localhost:8080/completedprojects', {
          username,
        });
       
        console.log('Response data:', response.data);
        // setActiveProjects(response.data);
       setProjects(response.data.projects);
        console.log(projects);
        

      } catch (error) {
        console.error('Error fetching active projects:', error);
      }
    };

    // Call the fetchActiveProjects function when component mounts
    fetchActiveProjects();
  }, []);

  return (
    <div className="completed-projects">
       <h2>Completed Projects</h2>
      <table>
        <thead>
          <tr>
            <th>Project ID</th>
            <th>Name</th>
            <th>Score</th>
            <th>Feedback</th>
          </tr>
        </thead>
        <tbody>
        {projects.map((projects,index) => (
            <tr key={index}>
              <td>{projects.project_id}</td>
              <td>{projects.project_title}</td>
              <td>{projects.project_score}</td>
              <td>{projects.project_feedback}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CompletedProjects;