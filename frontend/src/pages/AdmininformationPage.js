import React from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { useParams } from 'react-router-dom';
import AdminInfo from '../components/AdminInfo';
import '../css/Page.css';

const AdmininformationPage = () => {
  const { username } = useParams();
  console.log(username);
  return (
    <div class="container">
      <div class="Sidebar">
        <AdminSidebar />
      </div>
      <div class = "content">
        <AdminInfo/>
      </div>
    </div>
  );
};

export default AdmininformationPage;
