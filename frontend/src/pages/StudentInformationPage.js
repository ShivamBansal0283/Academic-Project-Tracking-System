import React from 'react';
import { useParams } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';
import StudentInformation from '../components/StudentInformation';
import '../css/Page.css';


const StudentInformationPage = () => {
    const { username } = useParams();
    console.log(username);
  return (
    <div className="container">
      <div className="Sidebar">
        <StudentSidebar/>
      </div>
      <div className="content">
        <StudentInformation/>
      </div>
    </div>
  );
};

export default StudentInformationPage;
