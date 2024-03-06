import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserMainPage from './Views/UserMainPage.jsx';
import LoginPage from './Views/LoginPage.jsx';
import SignupPage from './Views/SignupPage.jsx';
import DocPage from './Views/DocPage.jsx';
import ProjectsPage from './Views/ProjectsPage.jsx';
import LandingPage from './Views/LandingPage.jsx';


export default function App() {

  return (
 
        <Routes>
          <Route path="/usermain" Component={UserMainPage} />

          <Route path="/docs" Component={DocPage} />

          <Route path="/login" Component={LoginPage} />
          
          <Route path="/signup" Component={SignupPage} />

          <Route path="/projects" Component={ProjectsPage} />
          
          <Route path="/" Component={LandingPage} />
         
        </Routes>
    
  );
}
