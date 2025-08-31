import React from 'react';
import { useParams } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';
import CreateTeam from '../components/CreateTeam';
import '../css/Page.css';


const StudentCreateTeamPage= () => {
    const { username } = useParams();
    console.log(username);
  return (
    <div className="container">
      <div className="Sidebar">
        <StudentSidebar/>
      </div>
      <div className="content">
        <CreateTeam/>
      </div>
    </div>
  );
};

export default StudentCreateTeamPage;
