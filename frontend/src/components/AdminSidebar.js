// StudentPage.js
import React from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../css/Sidebar.css';


const AdminSidebar = () => {
  const { username } = useParams();
  const handleLogout = () => {
    // Perform logout logic here, such as clearing session storage or cookies
    // Redirect to the login page
    window.location.href = '/';
};
  return (
    <div className="admin-page">
      <div>
        <h2>Sidebar {username}</h2>
        <ul className="sidebar-menu">
          <li>
            <Link to={`/admin/${username}/showdetails`}>view details</Link>
          </li>
          <li>
            <Link to={`/admin/${username}/add`}>add new user</Link>
          </li>
          <li>
            <Link to={`/admin/${username}/info`}>Information</Link>
          </li>
          <li>
            <button class="logout-button" onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </div>

    </div>
  );
};

export default AdminSidebar;
