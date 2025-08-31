import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../css/CreateTeam.css'; // Import CSS for styling

const CreateTeam = () => {
  const { project } = useParams();
  const [teamName, setTeamName] = useState(''); // State for team name input
  const [teamId, setTeamId] = useState(''); // State for team ID input
  const [teamMembers, setTeamMembers] = useState([]);
  const [newMemberId, setNewMemberId] = useState('');
  const [teamCreated, setTeamCreated] = useState(false); // State to track team creation status

  const handleAddMember = () => {
    setTeamMembers([...teamMembers, newMemberId]);
    setNewMemberId('');
  };

  const handleCreateTeam = async () => {
    try {
      const response = await axios.post('http://localhost:8080/createTeam', {
        team_id: teamId,
        team_name: teamName,
        project_id: project,
        member_ids: teamMembers
      });
      
      console.log('Team created:', response.data);
      setTeamCreated(true); // Set teamCreated to true on successful team creation
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const renderForm = () => {
    return (
      <div className="form-container"> {/* Apply CSS class for styling */}
        <h3>Create Team for Project ID: {project}</h3>
        {/* Input field for team name */}
        <input
          type="text"
          placeholder="Enter Team Name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />
        <br />
        {/* Input field for team ID */}
        <input
          type="text"
          placeholder="Enter Team ID"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
        />
        <h4>Add Team Members:</h4>
        {teamMembers.map((member, index) => (
          <div key={index}>{member}</div>
        ))}
        <input
          type="text"
          placeholder="Enter Member ID"
          value={newMemberId}
          onChange={(e) => setNewMemberId(e.target.value)}
        />
        <button className="add-button" onClick={handleAddMember}>Add Member</button> {/* Apply CSS class for styling */}
        <button className="create-button" onClick={handleCreateTeam}>Create Team</button> {/* Apply CSS class for styling */}
      </div>
    );
  };

  const renderSuccessMessage = () => {
    return (
      <div className="success-message"> {/* Apply CSS class for styling */}
        <h3>Team Created Successfully!</h3>
        <p>Go to active project to see project.</p>
      </div>
    );
  };

  return (
    <div>
      {teamCreated ? renderSuccessMessage() : renderForm()}
    </div>
  );
};

export default CreateTeam;
