import React, { useState } from 'react';
import axios from 'axios';
import '../css/AddProject.css';

function AddProject() {
    const [projectId, setProjectId] = useState('');
    const [projectTitle, setProjectTitle] = useState('');
    const [course, setCourse] = useState('');
    const [projectDeadline, setProjectDeadline] = useState('');
    const [tasks, setTasks] = useState([{ taskId: '', taskName: '', taskDeadline: '' }]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleTaskChange = (index, e) => {
        const { name, value } = e.target;
        const list = [...tasks];
        list[index][name] = value;
        setTasks(list);
    };

    const handleAddTask = () => {
        setTasks([...tasks, { taskId: '', taskName: '', taskDeadline: '' }]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:8080/addproject', {
                projectId,
                projectTitle,
                course,
                projectDeadline,
                tasks
            });

            if (response.data.success) {
                setSuccess(true);
                setError('');
            } else {
                setSuccess(false);
                setError('Failed to add project.');
            }
        } catch (error) {
            setSuccess(false);
            setError('Error adding project.');
        }

        setLoading(false);
    };

    return (
        <div class="add-project">
            <h2>Add Project</h2>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {success && <p>Project added successfully!</p>}
            <form onSubmit={handleSubmit}>
                <label>
                    Project ID:
                    <input type="text" value={projectId} onChange={(e) => setProjectId(e.target.value)} required />
                </label>
                <label>
                    Project Title:
                    <input type="text" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} required />
                </label>
                <label>
                    Course:
                    <input type="text" value={course} onChange={(e) => setCourse(e.target.value)} required />
                </label>
                <label>
                    Project Deadline:
                    <input type="date" value={projectDeadline} onChange={(e) => setProjectDeadline(e.target.value)} required />
                </label>
                <h3>Tasks</h3>
                {tasks.map((task, index) => (
                    <div key={index}>
                        <label>
                            Task ID:
                            <input type="text" name="taskId" value={task.taskId} onChange={(e) => handleTaskChange(index, e)} required />
                        </label>
                        <label>
                            Task Name:
                            <input type="text" name="taskName" value={task.taskName} onChange={(e) => handleTaskChange(index, e)} required />
                        </label>
                        <label>
                            Task Deadline:
                            <input type="date" name="taskDeadline" value={task.taskDeadline} onChange={(e) => handleTaskChange(index, e)} required />
                        </label>
                    </div>
                ))}
                <button type="button" class="add-task-button" onClick={handleAddTask}>Add Task</button>
                <button type="submit">Add Project</button>
            </form>
        </div>
    );
}

export default AddProject;
