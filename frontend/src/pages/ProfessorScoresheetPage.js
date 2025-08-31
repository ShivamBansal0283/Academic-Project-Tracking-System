import React from 'react';
import { useParams } from 'react-router-dom';
import ProfessorSidebar from '../components/ProfessorSidebar';
import Scoresheet from '../components/Scoresheet';
import '../css/Page.css';

const ProfessorScoresheet = () => {
    const { username } = useParams();
    console.log(username);
  return (
    <div class="container">
      <div class = "Sidebar">
      <ProfessorSidebar/>
      </div>
      <div class="content">
      <Scoresheet/>
      </div>
    </div>
  );
};

export default ProfessorScoresheet;
