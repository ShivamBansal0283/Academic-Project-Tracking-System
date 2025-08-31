// ActiveProjects.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../css/Information.css';

const Information = () => {
  const [info, setInfo] = useState([]);
  const { username } = useParams();

  useEffect(() => {
    // Function to fetch active projects from backend
    const fetchInfo = async () => {
      try {
        const response = await axios.post('http://localhost:8080/information', {
          username,
        });
        setInfo(response.data.info);
      } catch (error) {
        console.error('Error fetching active projects:', error);
      }
    };

    // Call the fetchActiveProjects function when component mounts
    fetchInfo();
  }, []);

  return (
    <div className="information">
      <h2>Information</h2>
      <ul >
        {info.map((infoItem, index) => (
          <div key={index}>
            <p><strong>User ID:</strong> {infoItem.user_id}</p>
            <p><strong>User Name:</strong> {infoItem.name}</p>
          </div>
        ))}
      </ul>
    </div>
  );
};

export default Information;
