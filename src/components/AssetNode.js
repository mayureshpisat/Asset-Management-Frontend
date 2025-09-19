import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AvgStatsIcon from './AvgStatsIcon';

function AssetNode({ node, refreshHierarchy, searchTerm, fetchTotalAssets }) {
  const navigate = useNavigate();
  const { getAuthHeaders, token, user } = useAuth();
  
  // Auto-expand nodes that have search results or matching descendants
  const shouldAutoExpand = searchTerm && (node.isSearchResult || node.hasMatchingDescendant);
  const [expanded, setExpanded] = useState(shouldAutoExpand || true);
  const hasChildren = node.children && node.children.length > 0;
  const userRole = user.role;

  // Modal state (existing code)
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({
    parentId: '',
    id: '',
    name: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Drag and Drop state
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedNode, setDraggedNode] = useState(null);

  // Update expansion when search changes
  useEffect(() => {
    if (shouldAutoExpand) {
      setExpanded(true);
    }
  }, [searchTerm, shouldAutoExpand]);

  // Drag and Drop handlers
  const handleDragStart = (e) => {
    if (userRole !== "Admin") {
      e.preventDefault();
      return;
    }

    setIsDragging(true);
    setDraggedNode(node);
    
    // Store data for the drag operation
    e.dataTransfer.setData('application/json', JSON.stringify({
      id: node.id,
      name: node.name,
      parentId: node.parentId
    }));
    
    // Set drag effect
    e.dataTransfer.effectAllowed = 'move';
    
    // Add some visual feedback
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    setIsDragging(false);
    setDraggedNode(null);
    e.target.style.opacity = '1';
  };

  const handleDragOver = (e) => {
    if (userRole !== "Admin") return;
    
    e.preventDefault(); // Allow drop
    e.dataTransfer.dropEffect = 'move';
    
    // Get the dragged node data
    try {
      const draggedData = JSON.parse(e.dataTransfer.getData('application/json'));
      
      // Simple validation for drag over
      if (draggedData.id !== node.id) {
        setIsDragOver(true);
      }
    } catch (error) {
      // If we can't parse the data, don't allow drop
    }
  };

  const handleDragLeave = (e) => {
    // Only remove drag over state if we're actually leaving this element
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (userRole !== "Admin") return;

    try {
      const draggedData = JSON.parse(e.dataTransfer.getData('application/json'));
      
      // Validate the drop
      if (!isValidDropTarget(draggedData.id, node.id)) {
        alert('Cannot drop node on itself or its descendants');
        return;
      }

      // Don't move if it's already in the same parent
      if (draggedData.parentId === node.id) {
        return;
      }

      // Confirm the move
      if (!window.confirm(`Move "${draggedData.name}" to "${node.name}"?`)) {
        return;
      }

      // Call the reorder API
      await reorderAsset(draggedData.id, node.id);
      
    } catch (error) {
      console.error('Drop failed:', error);
      alert('Failed to move asset: ' + error.message);
    }
  };

  // Check if a drop target is valid
  const isValidDropTarget = (draggedId, targetId) => {
    // Can't drop on itself
    if (draggedId === targetId) {
      return false;
    }
    
    // Can't drop on its own descendants (would create a loop)
    return !isDescendant(draggedId, targetId, node);
  };

  // Check if targetId is a descendant of draggedId
  const isDescendant = (draggedId, targetId, currentNode) => {
    if (currentNode.id === draggedId) {
      return hasDescendantWithId(currentNode, targetId);
    }
    
    if (currentNode.children) {
      return currentNode.children.some(child => 
        isDescendant(draggedId, targetId, child)
      );
    }
    
    return false;
  };

  const hasDescendantWithId = (node, targetId) => {
    if (node.children) {
      return node.children.some(child => 
        child.id === targetId || hasDescendantWithId(child, targetId)
      );
    }
    return false;
  };

  // API call to reorder asset
  const reorderAsset = async (assetId, newParentId) => {
    try {
      const response = await fetch(
        `https://localhost:7242/api/AssetHierarchy/ReorderAsset/${assetId}/${newParentId}`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials : "include"
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      // Refresh the hierarchy to show the updated structure
      refreshHierarchy();
      fetchTotalAssets();
      
      alert('Asset moved successfully!');
    } catch (error) {
      console.error('Reorder failed:', error);
      throw error;
    }
  };

  // Existing methods (deleteNode, handleAddChild, etc.) remain the same...
  const deleteNode = async (id) => {
    if (window.confirm(`Are you sure you want to delete node with ID: ${id}?`)) {
      try {
        const response = await fetch(`https://localhost:7242/api/AssetHierarchy/${id}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
          credentials : "include"
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

  const handleAddChild = () => {
    setFormData({
      parentId: node.id,
      id: '',
      name: ''
    });
    setShowModal(true);
    setErrorMessage('');
  };

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

  const handleViewSignals = () => {
    navigate(`/signals/${node.id}/${node.name}`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const isUpdate = modalMode === 'update';
      let response;
      
      if (isUpdate) {
        const url = `https://localhost:7242/api/AssetHierarchy/Update/${formData.id}?name=${encodeURIComponent(formData.name)}`;
        response = await fetch(url, {
          method: "PUT",
          headers: getAuthHeaders(),
          credentials : "include"
        });
      } else {
        response = await fetch("https://localhost:7242/api/AssetHierarchy", {
          method: "POST",
          headers: getAuthHeaders(),
          credentials : "include",
          body: JSON.stringify(formData)
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

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

  const handleCloseModal = () => {
    setShowModal(false);
    setModalMode('add');
    setFormData({ parentId: '', id: '', name: '' });
    setErrorMessage('');
  };

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

  const getNodeStyle = () => {
    if (!searchTerm) return {};
    
    if (node.isSearchResult) {
      return {
        border: '1px solid #ADD8E6',
        borderRadius: '4px',
        padding: '2px 4px'
      };
    }
    
    return {};
  };

  // Combined styles for drag and drop + search
  const getCombinedNodeStyle = () => {
    const baseStyle = getNodeStyle();
    
    if (isDragOver) {
      return {
        ...baseStyle,
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        border: '2px dashed #28a745',
        borderRadius: '4px',
        padding: '4px'
      };
    }
    
    if (isDragging) {
      return {
        ...baseStyle,
        opacity: '0.5'
      };
    }
    
    return baseStyle;
  };

  return (
    <>
      <div className="ms-2 ps-2 border-start position-relative">
        <div
          // Drag and drop attributes
          draggable={userRole === "Admin"}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          
          onClick={() => hasChildren && setExpanded(!expanded)}
          className="d-flex align-items-center mb-1 py-1"
          style={{ 
            cursor: hasChildren ? 'pointer' : (userRole === "Admin" ? 'move' : 'default'),
            ...getCombinedNodeStyle()
          }}
          title={userRole === "Admin" ? "Drag to move this asset" : ""}
        >
          {/* Drag handle indicator for admins */}
          {userRole === "Admin" && (
            <span 
              className="bi bi-grip-vertical me-2"
              style={{
                color: '#6c757d',
                fontSize: '12px',
                opacity: '0.3'
              }}
            />
          )}

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
          
          {/* Search result indicator */}
          {searchTerm && node.isSearchResult && (
            <span className="badge bg-primary text-light ms-2 px-2 py-1" style={{ fontSize: '10px' }}>
              Match
            </span>
          )}

          {/* Drop zone indicator */}
          {isDragOver && (
            <span className="badge bg-success text-light ms-2 px-2 py-1" style={{ fontSize: '10px' }}>
              Drop Here
            </span>
          )}
          
          {/* Existing action buttons remain the same... */}
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
                handleUpdate(node);
              }}
              title={`Update: ${node.name}`}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.2'}
            />
          )}
          
          {userRole === "Admin" && (
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
          )}

          {userRole === "Admin" && <AvgStatsIcon nodeId = {node.id}/>}
        </div>

        {hasChildren && expanded && (
          <div>
            {node.children.map((child) => (
              <AssetNode 
                key={child.id} 
                node={child} 
                refreshHierarchy={refreshHierarchy}
                searchTerm={searchTerm}
                fetchTotalAssets={fetchTotalAssets}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal remains the same as your existing code */}
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