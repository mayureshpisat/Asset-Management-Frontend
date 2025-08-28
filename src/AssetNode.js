import React, { useState, useEffect } from 'react';

function AssetNode({ node, refreshHierarchy, searchTerm }) {
  // Auto-expand nodes that have search results or matching descendants
  const shouldAutoExpand = searchTerm && (node.isSearchResult || node.hasMatchingDescendant);
  const [expanded, setExpanded] = useState(shouldAutoExpand || true);
  const hasChildren = node.children && node.children.length > 0;

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    parentId: '',
    id: '',
    name: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  // Handle add child button click
  const handleAddChild = () => {
    setFormData({
      parentId: node.id,
      id: '',
      name: ''
    });
    setShowModal(true);
    setErrorMessage('');
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch("https://localhost:7242/api/AssetHierarchy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      // Success
      setShowModal(false);
      refreshHierarchy();
      alert("Child node added successfully!");
    } catch (error) {
      console.error("Add child failed:", error);
      setErrorMessage("Failed to add child: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ parentId: '', id: '', name: '' });
    setErrorMessage('');
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
    <>
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
            className="bi bi-plus-circle ms-2"  
            style={{
              color: "#4f3fdcff",
              cursor: 'pointer',
              opacity: '0.2',
              fontSize: '14px',
              userSelect: 'none'
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleAddChild();
            }}
            title={`Add Children to: ${node.name}`}
            onMouseEnter={(e) => e.target.style.opacity = '1'}
            onMouseLeave={(e) => e.target.style.opacity = '0.2'}
          />
          
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

      {/* Add Child Modal */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-primary">
                  <i className="bi bi-plus-circle me-2"></i>
                  Add Child Node
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseModal}
                ></button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">
                      Parent: {node.name}
                    </label>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="childId" className="form-label fw-semibold">
                      Child ID <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="childId"
                      name="id"
                      value={formData.id}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter unique child ID"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="childName" className="form-label fw-semibold">
                      Child Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="childName"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter child node name"
                    />
                  </div>
                  
                  {errorMessage && (
                    <div className="alert alert-danger py-2">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {errorMessage}
                    </div>
                  )}
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Adding...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-plus-circle me-2"></i>
                        Add Child
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AssetNode;