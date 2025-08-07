import React from 'react';
import AssetNode from './AssetNode';

function Siderbar({ hierarchy, refreshHierarchy }) {
  return (
    <div className="col-md-3 border-end p-3 bg-light shadow-sm">
      <h4 className="text-primary border-bottom pb-2 mb-3">Asset Hierarchy</h4>
      {hierarchy ? (
        <AssetNode node={hierarchy} refreshHierarchy={refreshHierarchy} />
      ) : (
        <p className="text-muted">Loading hierarchy...</p>
      )}
    </div>
  );
}

export default Siderbar;
