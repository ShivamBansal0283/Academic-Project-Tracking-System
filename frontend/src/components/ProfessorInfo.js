import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../css/Information.css';

function ProfessorInfo() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { username } = useParams();

    useEffect(() => {
        async function fetchAdmins() {
            try {
                const response = await axios.post('http://localhost:8080/professorinfo',{
                    username,
                });
                setAdmins(response.data.info);
                setLoading(false);
                setError('');
            } catch (error) {
                setError('Error fetching admin data.');
                setLoading(false);
            }
        }

        fetchAdmins();
    }, []);

    return (
        <div className="information">
            <h2>Professor Information</h2>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            <ul>
                {admins.map((admin, index) => (
                    <div key={index}>
                        <p><strong>User ID:</strong> {admin.user_id}</p>
                        <p><strong>Username:</strong> {admin.name}</p>
                        {/* Add more fields if needed */}
                    </div>
                ))}
            </ul>
        </div>
    );
}

export default ProfessorInfo;
