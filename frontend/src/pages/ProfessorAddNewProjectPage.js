import React from 'react';
import { useParams } from 'react-router-dom';
import ProfessorSidebar from '../components/ProfessorSidebar';
import AddProject from '../components/AddProject';
import '../css/Page.css';

const ProfessorAddNewProjectPage = () => {
    const { username } = useParams();
    console.log(username);
  return (
    <div class="container">
      <div class = "Sidebar">
      <ProfessorSidebar/>
      </div>
      <div class="content">
      <AddProject/>
      </div>
    </div>
  );
};

export default ProfessorAddNewProjectPage;
