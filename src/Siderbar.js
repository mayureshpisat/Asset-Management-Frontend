import React, { useEffect } from 'react';
import AssetNode from './AssetNode';
import { typeImplementation } from '@testing-library/user-event/dist/type/typeImplementation';

function filterTree(node, term) {
  if (!term || term.trim() === "") {
    return node; // no filtering
  }

  const lowerTerm = term.toLowerCase();

  // Check if current node matches
  const isMatch = node.name.toLowerCase().includes(lowerTerm);

  // Recursively filter children
  const filteredChildren = (node.children || [])
    .map((child) => filterTree(child, term))
    .filter((child) => child !== null);

  // Keep this node if it matches or if any child matched
  if (isMatch || filteredChildren.length > 0) {
    return { ...node, children: filteredChildren };
  }

  return null; // prune branch
}

function Siderbar({ hierarchy,totalAssets,fetchTotalAssets, refreshHierarchy, searchTerm, setSearchTerm }) {
  const filteredHierarchy = hierarchy && filterTree(hierarchy, searchTerm);
  useEffect(()=>{
    fetchTotalAssets();
  },);
  return (
    <div className="col-md-3 border-end p-3 bg-light shadow-sm">
      <h4 className="text-primary border-bottom pb-2 mb-3">Asset Hierarchy <p className='fs-6'>Total Assets: {totalAssets}</p></h4> 

      {/* 🔎 Search box */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="Search assets…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredHierarchy ? (
        filteredHierarchy.children && filteredHierarchy.children.length > 0 ? (
          filteredHierarchy.children.map((child) => (
            <AssetNode
              key={child.id}
              node={child}
              refreshHierarchy={refreshHierarchy}
            />
          ))
        ) : (
          <p className="text-muted">No matching assets.</p>
        )
      ) : (
        <p className="text-muted">Please upload a Hierarchy to start.</p>
      )}
    </div>
  );
}


export default Siderbar;
