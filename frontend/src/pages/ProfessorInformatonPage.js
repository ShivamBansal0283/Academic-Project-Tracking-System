import React from 'react';
import { useParams } from 'react-router-dom';
import ProfessorSidebar from '../components/ProfessorSidebar';
import ProfessorInfo from '../components/ProfessorInfo';
import '../css/Page.css';

const ProfessorInfomationPage = () => {
    const { username } = useParams();
    console.log(username);
  return (
    <div class="container">
      <div class = "Sidebar">
      <ProfessorSidebar/>
      </div>
      <div class="content">
      <ProfessorInfo/>
      </div>
    </div>
  );
};

export default ProfessorInfomationPage;
