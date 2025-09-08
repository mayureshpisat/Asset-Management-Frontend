import React, { useEffect, useState } from 'react';
import AssetNode from './AssetNode';
import { useAuth } from '../context/AuthContext';

function filterTree(node, term) {
  if (!term || term.trim() === "") {
    return node; // no filtering
  }
 
  const lowerTerm = term.toLowerCase();

  const isMatch = node.name.toLowerCase().includes(lowerTerm);

  if (isMatch) {
    return { ...node, isSearchResult: true };
  }

  const filteredChildren = (node.children || [])
    .map((child) => filterTree(child, term))
    .filter((child) => child !== null);

  return filteredChildren.length > 0 ? { 
    ...node, 
    children: filteredChildren,
    isSearchResult: false 
  } : null;
}

function Siderbar({ hierarchy, totalAssets, fetchTotalAssets, refreshHierarchy, searchTerm, setSearchTerm }) {
  const filteredHierarchy = hierarchy && filterTree(hierarchy, searchTerm);
  
  const { user,getAuthHeaders } = useAuth();
  const userRole = user.role;

  const [showModal, setShowModal] = useState(false);
  const [assetName, setAssetName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTotalAssets();
  },[]);

  const handleAddAsset = async () => {
  setError("");
  if (!assetName.trim()) {
    setError("Asset name cannot be empty.");
    return;
  }

  try {
    const res = await fetch(`https://localhost:7242/api/AssetHierarchy/AddNewAsset?assetName=${assetName}`, {
      method: "POST",
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      const errorMsg = await res.text();
      setError(errorMsg || "Failed to add asset.");
      return;
    }

    const data = await res.text();
    console.log(data);

    setAssetName("");
    setShowModal(false);
    refreshHierarchy();
    fetchTotalAssets();
  } catch (err) {
    setError("Failed to add asset.");
  }
};


  return (
    <div className="h-100">
      {/* Header Section */}
      <div className="shadow-sm p-4 rounded mb-4" style={{
        backgroundColor: "#f9fbfd",
        border: "1px solid #e0e6ed",
      }}>
        <h2 className="text-primary mb-2">
          Asset Hierarchy 
        </h2>
        <p className='fs-6 text-muted mb-3'>Total Assets: {totalAssets}</p>

        {/* Conditionally render Add Asset button */}
        {userRole === "Admin" && (
          <div className="mb-3">
            <button
              className="btn btn-primary w-100"
              onClick={() => setShowModal(true)}
            >
              <i className="bi bi-plus-circle me-2"></i> Add Asset
            </button>
          </div>
        )}
        
        {/* Search box */}
        <div className="mb-0">
          <input
            type="text"
            className="form-control"
            placeholder="Search assets…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              borderColor: "#ced4da",
            }}
          />
          {searchTerm && (
            <small className="text-muted mt-2 d-block">
              <i className="bi bi-info-circle me-1"></i>
              Showing nodes matching "{searchTerm}" and their parents/children
            </small>
          )}
        </div>
      </div>

      {/* Hierarchy Tree Section */}
      <div className="shadow-sm p-4 rounded" style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e0e6ed",
        minHeight: "60vh",
        maxHeight: "70vh",
        overflowY: "auto"
      }}>
        {filteredHierarchy ? (
          filteredHierarchy.children && filteredHierarchy.children.length > 0 ? (
            filteredHierarchy.children.map((child) => (
              <AssetNode
                key={child.id}
                node={child}
                refreshHierarchy={refreshHierarchy}
                searchTerm={searchTerm}
                fetchTotalAssets={fetchTotalAssets}
              />
            ))
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-diagram-3 display-1 text-muted mb-3"></i>
              <p className="text-muted fs-5">Please upload a Hierarchy to start.</p>
            </div>
          )
        ) : (
          <div className="text-center py-5">
            <i className="bi bi-search display-1 text-muted mb-3"></i>
            <p className="text-muted fs-5">No matching assets found.</p>
          </div>
        )}
      </div>

      {/* Add Asset Modal */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Asset</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter asset name"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                />
                {error && <small className="text-danger mt-2 d-block">{error}</small>}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAddAsset}>Add</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Siderbar;
