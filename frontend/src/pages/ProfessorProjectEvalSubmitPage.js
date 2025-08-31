import React from 'react';
import { useParams } from 'react-router-dom';
import ProfessorSidebar from '../components/ProfessorSidebar';
import ProjectEval from '../components/ProjectEval';
import '../css/Page.css';

const ProfessorProjectEvalSubmit = () => {
    const { username } = useParams();
    console.log(username);
  return (
    <div class="container">
      <div class = "Sidebar">
      <ProfessorSidebar/>
      </div>
      <div class="content">
      <ProjectEval/>
      </div>
    </div>
  );
};

export default ProfessorProjectEvalSubmit;
