import 'bootstrap-icons/font/bootstrap-icons.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Siderbar from './Siderbar.js';
import NewNode from './NewNode.js';
import Menu from './Menu.js';
import MergeHierarchy from './MergeHierarchy.js';
import LogsButton from './LogsButton.js';
import LogsPage from './LogsPage.js';
import SignalPage from './SignalPage.js';
import NavBar from './NavBar.js';
import LoginPage from './LoginPage.js';
import RegisterPage from './RegisterPage.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from './AuthContext';

// Loading component
function LoadingSpinner() {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Loading...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const [hierarchy, setHierarchy] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalAssets, setTotalAssets] = useState(0);

  // Get auth state including loading
  const { token, loading, isAuthenticated } = useAuth();

  const fetchTotalAssets = () => {
    fetch("https://localhost:7242/api/AssetHierarchy/TotalAssets")
      .then((res) => {
        if (!res.ok) {
          setTotalAssets(0);
        }
        return res.json();
      })
      .then((data) => setTotalAssets(data))
      .catch((error) => {
        console.log(error);
      });
  };

  const fetchHierarchy = () => {
    fetch("https://localhost:7242/api/AssetHierarchy")
      .then((res) => {
        if (!res.ok) {
          // If no hierarchy present
          setHierarchy(null);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        setHierarchy(data);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    if (isAuthenticated()) {
      fetchHierarchy();
    }
  }, [isAuthenticated]);

  // Show loading spinner while auth is initializing
  if (loading) {
    return <LoadingSpinner />;
  }

  // If user is authenticated, show main app with NavBar
  if (isAuthenticated()) {
    return (
      <>
        <NavBar />
        <Routes>
          <Route
            path="/"
            element={
              <div className="container-fluid">
                <div className="row">
                  {/* Main Hierarchy Section - Center */}
                  <div className="col-md-8 p-3">
                    <Siderbar
                      totalAssets={totalAssets}
                      fetchTotalAssets={fetchTotalAssets}
                      hierarchy={hierarchy}
                      refreshHierarchy={fetchHierarchy}
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                    />
                  </div>

                  {/* Sidebar with Upload/Download - Right */}
                  <div className="col-md-4 p-3 border-start bg-light">
                    <Menu refreshHierarchy={fetchHierarchy} fetchTotalAssets={fetchTotalAssets}/>
                    <div className="mt-3">
                      <MergeHierarchy refreshHierarchy={fetchHierarchy} fetchTotalAssets={fetchTotalAssets} />
                    </div>
                    
                  </div>
                </div>
              </div>
            }
          />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/signals/:assetId/:assetName" element={<SignalPage />} />
          
          {/* Redirect any auth routes to home when logged in */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </>
    );
  }

  // If user is not authenticated, show auth routes without NavBar
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      {/* Redirect any other route to login when not authenticated */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;