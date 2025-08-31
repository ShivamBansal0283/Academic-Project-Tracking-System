import React from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { useParams } from 'react-router-dom';
import '../css/Page.css';

const AdminPage = () => {
  const { username } = useParams();
  console.log(username);
  return (
    <div class="container">
      <div class="Sidebar">
        <AdminSidebar />
      </div>
      <div class = "content">
        <h2>Welcome to Admin Page</h2>
      </div>
    </div>
  );
};

export default AdminPage;
