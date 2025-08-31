// App.js


import { Route,Routes,BrowserRouter as Router } from 'react-router-dom';
import React from 'react';
import LoginForm from './components/LoginForm';
import StudentPage from './pages/StudentPage';
import ProfessorPage from './pages/ProfessorPage';
import AdminPage from './pages/AdminPage';
import StudentActiveProjectPage from './pages/StudentActiveProjectPage';
import StudentCompletedProjectPage from './pages/StudentCompletedProjectPage';
import StudentInformationPage from './pages/StudentInformationPage';
import StudentProjectPage from './pages/StudentProjectPage';
import AdminShowdetailsPage from './pages/AdminShowdetailsPage';
import AdminAddUsersPage from './pages/AdminAddUsersPage';
import AdminInformationPage from './pages/AdmininformationPage';
import ProfessorScoresheet from './pages/ProfessorScoresheetPage';
import ProfessorAddNewProjectPage from './pages/ProfessorAddNewProjectPage';
import ProfessorInfomationPage from './pages/ProfessorInformatonPage';
import ProfessorEvaluatePage from './pages/ProfessorEvaluatePage';
import ProfessorProjectEvalSubmit from './pages/ProfessorProjectEvalSubmitPage';
import StudentNewProjectPage from './pages/StudentNewProjectPage';
import StudentCreateTeamPage from './pages/StudentCreateTeamPage';

function App() {
  return (
    <Router>
    <div className="App">
    <Routes>
    <Route path="/" element={<LoginForm/>} />
    <Route path="/login" element={<LoginForm/>} />
    <Route path="/student/:username"element ={<StudentPage/>} />
    <Route path='/student/:username/active-projects' element= {<StudentActiveProjectPage/>}/>
    <Route path='/student/:username/completed-projects' element= {<StudentCompletedProjectPage/>}/>
    <Route path='/student/:username/information' element= {<StudentInformationPage/>}/>
    <Route path='/student/:username/activeprojects/:project' element= {<StudentProjectPage/>}/>
    <Route path='/student/:username/NewProject' element= {<StudentNewProjectPage/>}/>
    <Route path='/student/:username/NewProject/:project' element= {<StudentCreateTeamPage/>}/>
    <Route path='/admin/:username' element= {<AdminPage/>}/>
    <Route path='/admin/:username/showdetails' element= {<AdminShowdetailsPage/>}/>
    <Route path='/admin/:username/add' element= {<AdminAddUsersPage/>}/>
    <Route path='/admin/:username/info' element= {<AdminInformationPage/>}/>
    <Route path='/professor/:username' element= {<ProfessorPage/>}/>
    <Route path='/professor/:username/evaluate' element= {<ProfessorEvaluatePage/>}/>
    <Route path='/professor/:username/scoresheet' element= {<ProfessorScoresheet/>}/>
    <Route path='/professor/:username/addnewproject' element= {<ProfessorAddNewProjectPage/>}/>
    <Route path='/professor/:username/info' element= {<ProfessorInfomationPage/>}/>
    <Route path='/professor/:username/evaluate/:projectid' element= {<ProfessorProjectEvalSubmit/>}/>
    </Routes>
    </div>
    </Router>
  );
}

export default App;
