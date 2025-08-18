import React from 'react';
import AssetNode from './AssetNode';

function Siderbar({ hierarchy, refreshHierarchy }) {
  return (
    <div className="col-md-3 border-end p-3 bg-light shadow-sm">
      <h4 className="text-primary border-bottom pb-2 mb-3">Asset Hierarchy</h4>
      {hierarchy ? (
        hierarchy.children && hierarchy.children.length > 0 ? (
          hierarchy.children.map((child) => (
            <AssetNode
              key={child.id}
              node={child}
              refreshHierarchy={refreshHierarchy}
            />
          ))
        ) : (
          <p className="text-muted">No assets in hierarchy.</p>
        )
      ) : (
        <p className="text-muted">Please upload a Hierarchy to start.</p>
      )}
    </div>
  );
}


export default Siderbar;
