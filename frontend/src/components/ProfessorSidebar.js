// StudentPage.js
import React from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../css/Sidebar.css';

const ProfessorSidebar = () => {
  const { username } = useParams();
  const handleLogout = () => {
    // Perform logout logic here, such as clearing session storage or cookies
    // Redirect to the login page
    window.location.href = '/';
};
  return (
    <div className="professor-page">
      <div>
        <h2>Sidebar {username}</h2>
        <ul className="sidebar-menu">
          <li>
            <Link to={`/professor/${username}/evaluate`}>evaluate</Link>
          </li>
          <li>
            <Link to={`/professor/${username}/scoresheet`}>scoresheet</Link>
          </li>
          <li>
            <Link to={`/professor/${username}/addnewproject`}>add new project</Link>
          </li>
          <li>
            <Link to={`/professor/${username}/info`}>Information</Link>
          </li>
          <li>
            <button class="logout-button" onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </div>

    </div>
  );
};

export default ProfessorSidebar;
