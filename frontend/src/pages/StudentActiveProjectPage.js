import React from 'react';
import { useParams } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';
import ActiveProject from '../components/ActiveProject';
import '../css/Page.css';

const StudentActiveProjectPage= () => {
    const { username } = useParams();
    console.log(username);
  return (
    <div className="container">
      <div className="Sidebar">
        <StudentSidebar/>
      </div>
      <div className="content">
        <ActiveProject/>
      </div>
    </div>
  );
};

export default StudentActiveProjectPage;
