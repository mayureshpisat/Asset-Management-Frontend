import React, { useEffect } from 'react';
import AssetNode from './AssetNode';

function filterTree(node, term) {
  if (!term || term.trim() === "") {
    return node; // no filtering
  }

  const lowerTerm = term.toLowerCase();

  // Check if current node matches
  const isMatch = node.name.toLowerCase().includes(lowerTerm);

  // If this node matches, return it with all its children (don't filter children)
  if (isMatch) {
    return { ...node, isSearchResult: true };
  }

  // If this node doesn't match, recursively filter children
  const filteredChildren = (node.children || [])
    .map((child) => filterTree(child, term))
    .filter((child) => child !== null);

  // Only return children that matched (flattened view)
  return filteredChildren.length > 0 ? { 
    ...node, 
    children: filteredChildren,
    isSearchResult: false 
  } : null;
}

function Siderbar({ hierarchy, totalAssets, fetchTotalAssets, refreshHierarchy, searchTerm, setSearchTerm }) {
  const filteredHierarchy = hierarchy && filterTree(hierarchy, searchTerm);
  
  useEffect(() => {
    fetchTotalAssets();
  },);

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
    </div>
  );
}

export default Siderbar;