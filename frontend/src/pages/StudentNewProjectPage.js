import React from 'react';
import { useParams } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';
import NewProject from '../components/NewProject';
import '../css/Page.css';

const StudentNewProjectPage= () => {
    const { username } = useParams();
    console.log(username);
  return (
    <div className="container">
      <div className="Sidebar">
        <StudentSidebar/>
      </div>
      <div className="content">
        <NewProject/>
      </div>
    </div>
  );
};

export default StudentNewProjectPage;
