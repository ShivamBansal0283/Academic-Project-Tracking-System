import React from 'react';
import { useParams } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';
import '../css/Page.css';

const StudentPage = () => {
    const { username } = useParams();
    console.log(username);
  return (
    <div className="container">
      <div className="Sidebar">
        <StudentSidebar/>
      </div>
      <div className="content">
        <h2>Welcome {username} to Student Page</h2>
      </div>
    </div>
  );
};

export default StudentPage;
