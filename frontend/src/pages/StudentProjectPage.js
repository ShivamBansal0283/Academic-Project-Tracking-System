import React from 'react';
import { useParams } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';
import Project from '../components/Project';
import '../css/Page.css';

const StudentProjectPage = () => {
    const { username } = useParams();
    console.log(username);
  return (
    <div className="container">
      <div className="Sidebar">
        <StudentSidebar/>
      </div>
      <div className="content">
        <Project/>
      </div>
    </div>
  );
};

export default StudentProjectPage;
