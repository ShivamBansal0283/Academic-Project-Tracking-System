import React from 'react';
import { useParams } from 'react-router-dom';
import ProfessorSidebar from '../components/ProfessorSidebar';
import '../css/Page.css';

const ProfessorPage = () => {
    const { username } = useParams();
    console.log(username);
  return (
    <div class="container">
      <div class = "Sidebar">
      <ProfessorSidebar/>
      </div>
      <div class="content">
      <h2>Welcome to Professor Page</h2>
      </div>
    </div>
  );
};

export default ProfessorPage;
