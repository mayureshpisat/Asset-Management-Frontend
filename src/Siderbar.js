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
  }, []);

  return (
    <div className="col-md-3 border-end p-3 bg-light shadow-sm">
      <h4 className="text-primary border-bottom pb-2 mb-3">
        Asset Hierarchy 
        <p className='fs-6'>Total Assets: {totalAssets}</p>
      </h4> 

      {/* 🔍 Search box */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="Search assets…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <small className="text-muted mt-1 d-block">
            <i className="bi bi-info-circle me-1"></i>
            Showing nodes matching "{searchTerm}" and their parents/children
          </small>
        )}
      </div>

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
          <p className="text-muted">Please upload a Hierarchy to start.</p>
        )
      ) : (
        <p className="text-muted">No matching assets.</p>
      )}
    </div>
  );
}

export default Siderbar;