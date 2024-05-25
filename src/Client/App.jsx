import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserMainPage from './Views/UserMainPage.jsx';
import LoginPage from './Views/LoginPage.tsx';
import SignupPage from './Views/SignupPage.tsx';
import DocPage from './Views/DocPage.jsx';
import ProjectsPage from './Views/ProjectsPage.jsx';
import LandingPage from './Views/LandingPage.jsx';
import ProtectedRoute from './Components/ProtectedRoute.jsx';

// import './Styles/output.css';


export default function App() {


  return (
 
        // <Routes>
        //   <Route path="/usermain" Component={UserMainPage} />

        //   <Route path="/docs" Component={DocPage} />

        //   <Route path="/login" Component={LoginPage} />
          
        //   <Route path="/signup" Component={SignupPage} />

        //   <Route path="/projects" Component={ProjectsPage} />
          
        //   <Route path="/" Component={LandingPage} />
        // </Routes>

        <Routes>
          <Route path="/usermain" element={<ProtectedRoute component={<UserMainPage />} />} />

          <Route path="/docs" element={<DocPage />} />

          <Route path="/login" element={<LoginPage />} />

          <Route path="/signup" element={<SignupPage />} />

          <Route path="/projects" element={<ProtectedRoute component={<ProjectsPage />}/>} />

          <Route path="/" element={<LandingPage />} />
        </Routes>
    
  );
}