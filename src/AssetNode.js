import React, { useState } from 'react';

function AssetNode({ node }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="ms-2 ps-2 border-start position-relative">

      <div
        onClick={() => hasChildren && setExpanded(!expanded)}
        className="d-flex align-items-center mb-1 py-1"
        style={{ cursor: hasChildren ? 'pointer' : 'default' }}
      >
        {hasChildren && (
          <button
            className="btn btn-sm btn-outline-primary me-2"
            style={{ width: '28px', height: '28px', padding: '0' }}
            onClick={(e) => {
              e.stopPropagation(); 
              setExpanded(!expanded);
            }}
          >
            {expanded ? '-' : '+'}
          </button>
        )}
        <span className="fw-semibold">{node.name}</span>
      </div>

      {hasChildren && expanded && (
        <div>
          {node.children.map((child, index) => (
            <AssetNode key={index} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export default AssetNode;
