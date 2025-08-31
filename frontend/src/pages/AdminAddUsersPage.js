import React from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { useParams } from 'react-router-dom';
import Add from '../components/Add';
import '../css/Page.css';

const AdminAddUsersPage = () => {
  const { username } = useParams();
  console.log(username);
  return (
    <div class="container">
      <div class="Sidebar">
        <AdminSidebar/>
      </div>
      <div class = "content">
      <Add/>
      </div>
    </div>
  );
};

export default AdminAddUsersPage;
