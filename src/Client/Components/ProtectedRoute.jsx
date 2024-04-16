import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router';

const ProtectedRoute = ({ component: ProtectedComponent }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  console.log('isAuthenticated:', isAuthenticated)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        let response = await fetch('/api/checkSession');
        response = await response.json();
        return setIsAuthenticated(response.authenticated);

      } catch (err) {
        alert('Error occured while checking session');
        return setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // if (isAuthenticated === null) return <div>Loading...</div>
  
  if (isAuthenticated === true) {
    return ProtectedComponent;
  } else if (isAuthenticated === false) {
    return <Navigate to='/login'/>;
  }

};

export default ProtectedRoute;