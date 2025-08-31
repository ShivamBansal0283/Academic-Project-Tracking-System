import React, { useState } from 'react';
import axios from 'axios'; // Make sure axios is installed in your project
import '../css/Add.css';

function AddUsers() {
    const [userID, setUserID] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('');
    const [email, setEmail] = useState('');
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [departmentID, setDepartmentID] = useState('');
    const [isActive, setIsActive] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/add', {
                userID,
                username,
                password,
                userType,
                departmentID,
            });
            if (response.data.success) {
                setSuccessMessage('User added successfully.');
                setErrorMessage('');
            } else {
                setSuccessMessage('');
                setErrorMessage('Failed to add user.');
            }
        } catch (error) {
            setSuccessMessage('');
            setErrorMessage('An error occurred while adding the user.');
        }
    };

    return (
        <div class= "add-users">
            <h2>Add User</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    UserID:
                    <input type="text" value={userID} onChange={(e) => setUserID(e.target.value)} />
                </label>
                <label>
                    Username:
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                </label>
                <label>
                    Password:
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>
                <label>
                    UserType:
                    <input type="text" value={userType} onChange={(e) => setUserType(e.target.value)} />
                </label>
                <label>
                    Department ID:
                    <input type="text" value={departmentID} onChange={(e) => setDepartmentID(e.target.value)} />
                </label>
                <button type="submit">Add User</button>
            </form>
            {successMessage && <p>{successMessage}</p>}
            {errorMessage && <p>{errorMessage}</p>}
        </div>
    );
}

export default AddUsers;
