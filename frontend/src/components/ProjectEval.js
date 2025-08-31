import React, { useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import '../css/ProjectEval.css';

const NextPageComponent = () => {
  const { state } = useLocation();
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState(null);

  const project = state.project;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send marks, feedback, and project array to the backend
      await axios.post('http://localhost:8080/submiteval', {
        project,
        marks,
        feedback,
      });
      // Set success message
      setMessage('Submission successful');
    } catch (error) {
      // Set error message
      setMessage('Submission failed');
      console.error('Error submitting marks, feedback, and project array:', error);
    }
  };

  return (
    <div class="next-page">
      <h2>Project Details</h2>
      {/* Display project details here */}
      
      <h3>Enter Marks and Feedback</h3>
      <form onSubmit={handleSubmit}>
        <label>
          Marks:
          <input 
            type="number" 
            value={marks} 
            onChange={(e) => setMarks(e.target.value)} 
            required 
          />
        </label>
        <br />
        <label>
          Feedback:
          <textarea 
            value={feedback} 
            onChange={(e) => setFeedback(e.target.value)} 
            required 
          />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>
      
      {/* Display message if exists */}
      {message && <p>{message}</p>}
    </div>
  );
};

export default NextPageComponent;
