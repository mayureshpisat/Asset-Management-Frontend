import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    // Navigate to home page after logout
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        {/* Brand */}
        <button 
          className="navbar-brand btn btn-link text-white text-decoration-none p-0"
          onClick={handleHome}
        >
          <i className="bi bi-diagram-3 me-2"></i>
          Asset Management System
        </button>

        {/* Toggle button for mobile */}
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation items */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            
            <li className="nav-item">
              <button 
                className={`nav-link btn btn-link text-white p-2 ${location.pathname === '/logs' ? 'active' : ''}`}
                onClick={() => navigate('/logs')}
              >
                <i className="bi bi-file-text me-1"></i>
                Import Logs
              </button>
            </li>
          </ul>

          {/* Authentication section */}
          <div className="d-flex align-items-center">
            {isAuthenticated() ? (
              <div className="d-flex align-items-center">
                {/* User info */}
                <div className="text-white me-3">
                  <i className="bi bi-person-circle me-2"></i>
                  <span className="me-2">{user.username}</span>
                  <span className="badge bg-light text-primary">{user.role}</span>
                </div>
                
                {/* Logout button */}
                <button 
                  className="btn btn-outline-light btn-sm"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-1"></i>
                  Logout
                </button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-outline-light btn-sm"
                  onClick={handleLogin}
                >
                  <i className="bi bi-box-arrow-in-right me-1"></i>
                  Login
                </button>
                <button 
                  className="btn btn-light btn-sm"
                  onClick={handleRegister}
                >
                  <i className="bi bi-person-plus me-1"></i>
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;