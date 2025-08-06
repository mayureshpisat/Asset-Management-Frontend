import React from 'react';
import Sidebar from './Siderbar.js';
import Menu from './Menu.js'
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [hierarchy, setHierarchy] = useState(null)

  // Reusable fetch function
  const fetchHierarchy = () => {
    fetch("https://localhost:7242/api/AssetHierarchy")
      .then((res) => res.json())
      .then((data) => setHierarchy(data))
      .catch((error) => console.log(error));
  };

  // Fetch only on mount
  useEffect(() => {
    fetchHierarchy();
  }, []);


  return (
    <div className="container-fluid">
      <div className="row">
        {/* Pass the hierarchy fetched to the Sidebar for tree display */}
        <Sidebar hierarchy={hierarchy} />

        {/* Place holder for Menu */}
        <div className="col-md-9 p-3">
          <Menu refreshHierarchy={fetchHierarchy}/>
        </div>
      </div>
    </div>
  );
}

export default App;
