import React, { useState } from 'react';
import axios from 'axios'; // Make sure axios is installed in your project
import '../css/Showdetails.css';

function ShowDetails() {
    const [userID, setUserID] = useState('');
    const [userDetails, setUserDetails] = useState([]);
    const [error, setError] = useState('');
    var c=0;

    const handleUserIDChange = (e) => {
        setUserID(e.target.value);
    };

    const fetchUserDetails = async () => {
        c++;
        try {
            setError(''); // Clear error message when fetching new user details
            const response = await axios.post('http://localhost:8080/showdetails',{
                userID,
            }); // Forming URL with userID entered by the user
            setUserDetails(response.data.details);
            console.log(userID)

        } catch (error) {
            setUserDetails([]); // Clear userDetails in case of error or no user found
            setError('User not found or an error occurred.');
        }
    };

    return (
        <div className="show-details">
            <h2>Show User Details</h2>
            <input type="text" value={userID} onChange={handleUserIDChange} placeholder="Enter User ID" />
            <button onClick={fetchUserDetails}>Fetch Details</button>
            {error && <p>{error}</p>}
            {userDetails.length > 0 && (
                <table>
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>User Name</th>
                            <th>role</th>
                            <th>deptid</th>
                            <th>deptname</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userDetails.map((details, index) => (
                            <tr key={index}>
                                <td>{details.user_id}</td>
                                <td>{details.user_name}</td>
                                <td>{details.role}</td>
                                <td>{details.dept_id}</td>
                                <td>{details.dept_name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {userDetails.length === 0 && error === '' && c!==0 && <p>No user details found</p>}
        </div>
    );
}

export default ShowDetails;
