import React, { useState } from 'react';

function AssetNode({ node, refreshHierarchy }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const copyToClipboard = (id) => {
    navigator.clipboard.writeText(id).then(() => {
      console.log('ID copied to clipboard:', id);
    }).catch(err => {
      console.error('Failed to copy ID:', err);
    });
  };

  const deleteNode = async (id) => {
    if (window.confirm(`Are you sure you want to delete node with ID: ${id}?`)) {
      try {
        const response = await fetch(`https://localhost:7242/api/AssetHierarchy/${id}`, {
          method: "DELETE"
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }

        alert("Node deleted successfully!");
        refreshHierarchy();
      } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete node: " + error.message);
      }
    }
  };


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
            {expanded ? '-'  : '+'}
          </button>
        )}
        <span className="fw-semibold">{node.name}</span>
        <span 
          className="bi bi-copy ms-2" 
          style={{
            cursor: 'pointer',
            opacity: '0.2',
            fontSize: '14px',
            userSelect: 'none'
          }}
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard(node.id);
          }}
          title={`Copy ID: ${node.id}`}
          onMouseEnter={(e) => e.target.style.opacity = '1'}
          onMouseLeave={(e) => e.target.style.opacity = '0.2'}
        >
          
        </span>
        <span 
          className="bi bi-trash ms-2"  
          style={{
            color: "#ff0000",
            cursor: 'pointer',
            opacity: '0.2',
            fontSize: '14px',
            userSelect: 'none'
          }}
          onClick={(e) => {
            e.stopPropagation();
            deleteNode(node.id);
          }}
          title={`Copy ID: ${node.id}`}
          onMouseEnter={(e) => e.target.style.opacity = '1'}
          onMouseLeave={(e) => e.target.style.opacity = '0.2'}
        >
          
        </span>
      </div>

      {hasChildren && expanded && (
        <div>
          {node.children.map((child, index) => (
            <AssetNode key={index} node={child} refreshHierarchy={refreshHierarchy} />
          ))}
        </div>
      )}
    </div>
  );
}

export default AssetNode;