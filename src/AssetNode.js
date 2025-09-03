import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function AssetNode({ node, refreshHierarchy, searchTerm,fetchTotalAssets}) {
  const navigate = useNavigate();

  //get auth values
  const {getAuthHeaders, token, user} = useAuth();
  console.log("FROM ASSET NODE" +getAuthHeaders()["Authorization"])

  // Auto-expand nodes that have search results or matching descendants
  const shouldAutoExpand = searchTerm && (node.isSearchResult || node.hasMatchingDescendant);
  const [expanded, setExpanded] = useState(shouldAutoExpand || true);
  const hasChildren = node.children && node.children.length > 0;
  const userRole = user.role;

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
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


  const deleteNode = async (id) => {
    if (window.confirm(`Are you sure you want to delete node with ID: ${id}?`)) {
      try {
        const response = await fetch(`https://localhost:7242/api/AssetHierarchy/${id}`, {
          method: "DELETE",
          headers : getAuthHeaders()
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }

        alert("Node deleted successfully!");
        refreshHierarchy();
        fetchTotalAssets();
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

// Handle update node button click
  const handleUpdate = (nodeToUpdate) => {
  setModalMode('update');
  setFormData({
    parentId: nodeToUpdate.parentId || '',
    id: nodeToUpdate.id,
    name: nodeToUpdate.name
  });
  setShowModal(true);
  setErrorMessage('');
};

  // Handle navigate to signals
  const handleViewSignals = () => {
    navigate(`/signals/${node.id}/${node.name}`);
  };

  // Handle input changes
const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};

  // Handle form submission
  // Handle form submission for both Add and Update
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setErrorMessage('');

  try {
    const isUpdate = modalMode === 'update';
    
    let response;
    
    if (isUpdate) {
      // For Update: Use PUT with query parameter
      const url = `https://localhost:7242/api/AssetHierarchy/Update/${formData.id}?name=${encodeURIComponent(formData.name)}`;
      response = await fetch(url, {
        method: "PUT",
        headers: getAuthHeaders()
      });
    } else {
      // For Add: Use POST with JSON body
      response = await fetch("https://localhost:7242/api/AssetHierarchy", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    // Success
    setShowModal(false);
    refreshHierarchy();
    fetchTotalAssets();
    
  } catch (error) {
    console.error(`${modalMode} failed:`, error);
    setErrorMessage(`Failed to ${modalMode} ${modalMode === 'add' ? 'child' : 'node'}: ` + error.message);
  } finally {
    setIsSubmitting(false);
  }
};


  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setModalMode('add');
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
          
          {/* Signal Button */}
          <span 
            className="bi bi-broadcast ms-2"  
            style={{
              color: "#28a745",
              cursor: 'pointer',
              opacity: '0.2',
              fontSize: '14px',
              userSelect: 'none'
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleViewSignals();
            }}
            title={`View Signals for: ${node.name}`}
            onMouseEnter={(e) => e.target.style.opacity = '1'}
            onMouseLeave={(e) => e.target.style.opacity = '0.2'}
          />
          
          {/* Add Button (only for Admins) */}
{userRole === "Admin" && (
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
)}

          {userRole === "Admin" && (
  <span 
    className="bi bi-pencil-square ms-2"
    style={{
      cursor: 'pointer',
      opacity: '0.2',
      fontSize: '14px',
      userSelect: 'none'
    }}
    onClick={(e) => {
      e.stopPropagation();
      handleUpdate(node); // ✅ now calls the actual handleUpdate method
    }}
    title={`Update: ${node.name}`}
    onMouseEnter={(e) => e.target.style.opacity = '1'}
    onMouseLeave={(e) => e.target.style.opacity = '0.2'}
  />
)}
          
          {/* Delete Button (only for Admins) */}
          {userRole === "Admin" &&
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
          />}
          
        </div>

        {hasChildren && expanded && (
          <div>
            {node.children.map((child) => (
              <AssetNode 
                key={child.id} 
                node={child} 
                refreshHierarchy={refreshHierarchy}
                searchTerm={searchTerm}
                fetchTotalAssets = {fetchTotalAssets}
              />
            ))}
          </div>
        )}
      </div>

      {/* Updated Modal JSX*/}
{showModal && (
  <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title text-primary">
            <i className={`bi ${modalMode === 'add' ? 'bi-plus-circle' : 'bi-pencil-square'} me-2`}></i>
            {modalMode === 'add' ? 'Add Child Node' : 'Update Node'}
          </h5>
          <button 
            type="button" 
            className="btn-close" 
            onClick={handleCloseModal}
          ></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Show parent info only for Add mode */}
            {modalMode === 'add' && (
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted">
                  <i className="bi bi-diagram-3 me-1"></i>
                  Parent: {node.name}
                </label>
              </div>
            )}
            
            <div className="mb-3">
              <label htmlFor="childName" className="form-label fw-semibold">
                {modalMode === 'add' ? 'Child Name' : 'Node Name'} <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="childName"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder={modalMode === 'add' ? 'Enter child node name' : 'Enter node name'}
                maxLength="30"
              />
              <small className="text-muted">
                Only letters, numbers, and spaces allowed (max 30 characters)
              </small>
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
                  {modalMode === 'add' ? 'Adding...' : 'Updating...'}
                </>
              ) : (
                <>
                  <i className={`bi ${modalMode === 'add' ? 'bi-plus-circle' : 'bi-check-circle'} me-2`}></i>
                  {modalMode === 'add' ? 'Add Child' : 'Update Node'}
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