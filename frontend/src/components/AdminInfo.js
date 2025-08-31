import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../css/Information.css';

function AdminInfo() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { username } = useParams();

    useEffect(() => {
        async function fetchAdmins() {
            try {
                const response = await axios.post('http://localhost:8080/admininfo', {
                    username,
                });
                setAdmins(response.data.info);
                setLoading(false);
                setError('');
                console.log(admins);
            } catch (error) {
                setError('Error fetching admin data.');
                setLoading(false);
            }
        }

        fetchAdmins();
    }, []);

    return (
        <div className="information">
            <h2>Admin Information</h2>
                {admins.map((admin, index) => (
                    <div key={index}>
                        <p><strong>User ID:</strong> {admin.user_id}</p>
                        <p><strong>Username:</strong> {admin.name}</p>
                        {/* Add more fields if needed */}
                    </div>
                ))}
        </div>
    );
}

export default AdminInfo;
