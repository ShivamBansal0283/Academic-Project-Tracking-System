import React from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { useParams } from 'react-router-dom';
import Showdetails from '../components/Showdetails';
import '../css/Page.css';

const AdminShowdetailsPage = () => {
  const { username } = useParams();
  console.log(username);
  return (
    <div class="container">
      <div class="Sidebar">
        <AdminSidebar/>
      </div>
      <div class = "content">
      <Showdetails/>
      </div>
    </div>
  );
};

export default AdminShowdetailsPage;
