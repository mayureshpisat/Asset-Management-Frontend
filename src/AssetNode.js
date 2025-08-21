import React, { useState, useEffect } from 'react';

function AssetNode({ node, refreshHierarchy, searchTerm }) {
  // Auto-expand nodes that have search results or matching descendants
  const shouldAutoExpand = searchTerm && (node.isSearchResult || node.hasMatchingDescendant);
  const [expanded, setExpanded] = useState(shouldAutoExpand || true);
  const hasChildren = node.children && node.children.length > 0;

  // Update expansion when search changes
  useEffect(() => {
    if (shouldAutoExpand) {
      setExpanded(true);
    }
  }, [searchTerm, shouldAutoExpand]);

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

  // Function to highlight matching text
  const highlightText = (text, searchTerm) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-primary bg-opacity-25 rounded px-1">
  {part}
</span>
      ) : (
        part
      )
    );
  };

  // Determine styling based on search results
  const getNodeStyle = () => {
    if (!searchTerm) return {};
    
    if (node.isSearchResult) {
      return {
        border: '1px solid #ADD8E6',
        borderRadius: '4px',
        padding: '2px 4px'
      };
    } else if (node.hasMatchingDescendant) {
      return {
      };
    }
    
    return {};
  };

  return (
    <div className="ms-2 ps-2 border-start position-relative">
      <div
        onClick={() => hasChildren && setExpanded(!expanded)}
        className="d-flex align-items-center mb-1 py-1"
        style={{ 
          cursor: hasChildren ? 'pointer' : 'default',
          ...getNodeStyle()
        }}
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
        
        <span className="fw-semibold">
          {highlightText(node.name, searchTerm)}
        </span>
        
        {/* Show search result indicator */}
        {searchTerm && node.isSearchResult && (
          <span className="badge bg-primary text-light ms-2 px-2 py-1" style={{ fontSize: '10px' }}>
            Match
          </span>
        )}
        
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
        />
        
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
          title={`Delete node: ${node.name}`}
          onMouseEnter={(e) => e.target.style.opacity = '1'}
          onMouseLeave={(e) => e.target.style.opacity = '0.2'}
        />
      </div>

      {hasChildren && expanded && (
        <div>
          {node.children.map((child) => (
            <AssetNode 
              key={child.id} 
              node={child} 
              refreshHierarchy={refreshHierarchy}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AssetNode;