import React from 'react';
import { useParams, Link } from 'react-router-dom';
import '../css/Sidebar.css';

const StudentSidebar = () => {
    const { username } = useParams();

    // Handle logout
    const handleLogout = () => {
        // Perform logout logic here, such as clearing session storage or cookies
        // Redirect to the login page
        window.location.href = '/';
    };

    return (
        <div className="student-page">
            <div >
                <h2>Sidebar {username}</h2>
                <ul className="sidebar-menu">
                    <li>
                        <Link to={`/student/${username}/active-projects`} className="active-projects">Active Projects</Link>
                    </li>
                    <li>
                        <Link to={`/student/${username}/completed-projects`}>Completed Projects</Link>
                    </li>
                    <li>
                        <Link to={`/student/${username}/information`}>Information</Link>
                    </li>
                    <li>
                        <Link to={`/student/${username}/NewProject`}>New Project</Link>
                    </li>
                    <li>
                        <button class="logout-button" onClick={handleLogout}>Logout</button>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default StudentSidebar;
