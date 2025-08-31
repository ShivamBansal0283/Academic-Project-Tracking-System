import React from 'react';
import { useParams } from 'react-router-dom';
import ProfessorSidebar from '../components/ProfessorSidebar';
import Evaluate from '../components/Evaluate';
import '../css/Page.css';

const ProfessorEvaluatePage = () => {
    const { username } = useParams();
    console.log(username);
  return (
    <div class="container">
      <div class = "Sidebar">
      <ProfessorSidebar/>
      </div>
      <div class="content">
      <Evaluate/>
      </div>
    </div>
  );
};

export default ProfessorEvaluatePage;
