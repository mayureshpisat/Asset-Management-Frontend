import 'bootstrap-icons/font/bootstrap-icons.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Siderbar from './Siderbar.js';
import NewNode from './NewNode.js';
import Menu from './Menu.js';
import MergeHierarchy from './MergeHierarchy.js';
import LogsButton from './LogsButton.js';
import LogsPage from './LogsPage.js';
import SignalPage from './SignalPage.js';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [hierarchy, setHierarchy] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalAssets, setTotalAssets] = useState(0);

  console.log(searchTerm);
  //Get total number of assets
  const fetchTotalAssets = () =>{
    fetch("https://localhost:7242/api/AssetHierarchy/TotalAssets").then((res)=>{
      if (!res.ok){
        setTotalAssets(0)
      }
      return res.json()
    }).then((data)=>{
      setTotalAssets(data)
    }).catch((error)=>{
      console.log(error)
    })
  }

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
      .then((data) => {setHierarchy(data)
      })
      .catch((error) => console.log(error));
      
  };

  useEffect(() => {
    fetchHierarchy();
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="container-fluid">
              <div className="row">
                {/* Main Hierarchy Section - Center */}
                <div className="col-md-8 p-3">
                  <Siderbar
                    totalAssets = {totalAssets}
                    fetchTotalAssets = {fetchTotalAssets}
                    hierarchy={hierarchy}
                    refreshHierarchy={fetchHierarchy}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                  />
                </div>
                
                {/* Sidebar with Upload/Download - Right */}
                <div className="col-md-4 p-3 border-start bg-light">
                  <Menu refreshHierarchy={fetchHierarchy} />
                  <div className="mt-3">
                    <MergeHierarchy refreshHierarchy={fetchHierarchy} />
                  </div>
                  <div className="mt-3">
                    <LogsButton refreshHierarchy={fetchHierarchy} />
                  </div>
                </div>
              </div>
            </div>
          }
        />
        <Route path="/logs" element={<LogsPage />} />
        <Route path="/signals/:assetId/:assetName" element={<SignalPage />} />
      </Routes>
    </Router>
  );
}

export default App;