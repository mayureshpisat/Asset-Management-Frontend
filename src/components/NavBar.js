import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotificationProvider, useNotifications } from '../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';
function NavBar() {

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    // No need to navigate manually - App.js will handle the redirect
  };

  const handleHome = () => {
    navigate('/');
  };


  const handleLogs = () =>{
    navigate('/logs');
  }
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
                className={`nav-link btn btn-link text-white p-2`}
                onClick = {handleLogs}
              >
                <i className="bi bi-file-text me-1"></i>
                Import Logs
              </button>
            </li>
          </ul>

          {/* User info and logout */}
          <div className="d-flex align-items-center">
            <NotificationDropdown/>
            <div className="d-flex align-items-center">
              {/* User info */}
              <div className="text-white me-3">
                <i className="bi bi-person-circle me-2"></i>
                <span className="me-2">{user?.username}</span>
                <span className="badge bg-light text-primary">{user?.role}</span>
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
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;