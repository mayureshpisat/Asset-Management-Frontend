import 'bootstrap-icons/font/bootstrap-icons.css';
import React from 'react';
import Siderbar from './Siderbar.js';
import NewNode from './NewNode.js'
import Menu from './Menu.js'
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [hierarchy, setHierarchy] = useState(null)

  // fetch function for reuse
  const fetchHierarchy = () => {
    fetch("https://localhost:7242/api/AssetHierarchy")
      .then((res) => res.json())
      .then((data) => setHierarchy(data))
      .catch((error) => console.log(error));
  };

  
  useEffect(() => {
    fetchHierarchy();
  }, []);


  return (
    <div className="container-fluid">
      <div className="row">
        {/* Pass the hierarchy fetched to the Sidebar for tree display */}
        <Siderbar hierarchy={hierarchy} refreshHierarchy={fetchHierarchy} />

        {/* Place holder for Menu */}
        <div className="col-md-9 p-3">
          <Menu refreshHierarchy={fetchHierarchy}/>
          <NewNode refreshHierarchy={fetchHierarchy}/>

        </div>
      </div>
    </div>
  );
}

export default App;
