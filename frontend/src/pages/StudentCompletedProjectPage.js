import React from 'react';
import { useParams } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';
import CompletedProject from '../components/CompletedProject';
import '../css/Page.css';

const StudentCompletedProjectPage = () => {
    const { username } = useParams();
    console.log(username);
  return (
    <div className="container">
      <div className="Sidebar">
        <StudentSidebar/>
      </div>
      <div className="content">
        <CompletedProject/>
      </div>
    </div>
  );
};

export default StudentCompletedProjectPage;
