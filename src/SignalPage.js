import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function SignalPage() {
  
  const { assetId, assetName } = useParams();
  const navigate = useNavigate();
  const [signals, setSignals] = useState([]);
  // const [assetName, setAssetName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state for adding new signal
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSignal, setEditingSignal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    valueType: 'string',
    description: '',
    assetId: parseInt(assetId)
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  //get user: Admin or Viewer
  const {user} = useAuth();
  const userRole = user.role;


  // Fetch signals for the asset
  const fetchSignals = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://localhost:7242/api/Signals/Asset/${assetId}/AllSignals`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch signals: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSignals(data);
      
      // Get asset name from the first signal's asset property
      // if (data.length > 0 && data[0].asset) {
      //   setAssetName(data[0].asset.name);
      // }
      
      setError('');
    } catch (err) {
      console.error('Error fetching signals:', err);
      setError(err.message);
      setSignals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assetId) {
      fetchSignals();
    }
  }, [assetId]);

  // Handle add signal
  const handleAddSignal = () => {
    setFormData({
      name: '',
      valueType: 'string',
      description: ''
    });
    setShowAddModal(true);
    setModalError('');
  };

  // Handle edit signal
  const handleEditSignal = (signal) => {
    setEditingSignal(signal);
    setFormData({
      name: signal.name,
      valueType: signal.valueType,
      description: signal.description,
      assetId: signal.assetId
    });
    setShowEditModal(true);
    setModalError('');
  };

  // Handle delete signal
  const handleDeleteSignal = async (signalId, signalName) => {
    if (window.confirm(`Are you sure you want to delete signal: ${signalName}?`)) {
      try {
        const response = await fetch(`https://localhost:7242/api/Signals/Asset/${assetId}/Delete/Signal/${signalId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.log(errorText);
          throw new Error(errorText);
        }

        alert('Signal deleted successfully!');
        fetchSignals();
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete signal: ' + error.message);
      }
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission for add
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError('');

    try {
      const response = await fetch(`https://localhost:7242/api/Signals/Asset/${assetId}/AddSignal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      setShowAddModal(false);
      fetchSignals();
      alert('Signal added successfully!');
    } catch (error) {
      console.error('Add signal failed:', error.message);
      setModalError('Failed to add signal: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission for edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError('');

    try {
      const response = await fetch(`https://localhost:7242/api/Signals/Asset/${assetId}/UpdateSignal/${editingSignal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      setShowEditModal(false);
      setEditingSignal(null);
      fetchSignals();
      alert('Signal updated successfully!');
    } catch (error) {
      console.error('Update signal failed:', error);
      setModalError('Failed to update signal: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingSignal(null);
    setFormData({
      name: '',
      valueType: 'string',
      description: '',
      assetId: parseInt(assetId)
    });
    setModalError('');
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button 
            className="btn btn-outline-secondary mb-2"
            onClick={() => navigate('/')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Hierarchy
          </button>
          <h2 className="text-primary mb-0">
            <i className="bi bi-broadcast me-2"></i>
            Signals for: {`Asset ${assetName}`}
          </h2>
          
        </div>
        {userRole === "Admin" &&<button
          className="btn btn-primary"
          onClick={handleAddSignal}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Add Signal
        </button> }
        
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Signals List */}
      {signals.length === 0 && !error ? (
        <div className="text-center text-muted py-5">
          <i className="bi bi-broadcast" style={{ fontSize: '3rem' }}></i>
          <h4 className="mt-3">No Signals Found</h4>
          <p>This asset doesn't have any signals yet. Click "Add Signal" to create one.</p>
        </div>
      ) : (
        <div className="row">
          {signals.map((signal) => (
            <div key={signal.id} className="col-md-6 col-lg-4 mb-3">
              <div className="card h-100">
                <div className="card-header bg-primary text-white">
                  <h6 className="mb-0">
                    <i className="bi bi-broadcast me-2"></i>
                    {signal.name}
                  </h6>
                </div>
                <div className="card-body">
                  <div className="mb-2">
                    <strong className="text-muted">Value Type:</strong>
                    <span className="badge bg-secondary ms-2">{signal.valueType}</span>
                  </div>
                  <div className="mb-3">
                    <strong className="text-muted">Description:</strong>
                    <p className="mt-1 mb-0">{signal.description || 'No description provided'}</p>
                  </div>
                </div>
                {userRole==="Admin" && 
                <div className="card-footer bg-light">
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleEditSignal(signal)}
                      title="Edit Signal"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteSignal(signal.id, signal.name)}
                      title="Delete Signal"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
                }
                
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Signal Modal */}
      {showAddModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-primary">
                  <i className="bi bi-plus-circle me-2"></i>
                  Add New Signal
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseModal}
                ></button>
              </div>
              
              <form onSubmit={handleAddSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">
                      <i className="bi bi-diagram-3 me-1"></i>
                      Asset: {assetName || `Asset ${assetId}`}
                    </label>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="signalName" className="form-label fw-semibold">
                      Signal Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="signalName"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter signal name"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="valueType" className="form-label fw-semibold">
                      Value Type <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="valueType"
                      name="valueType"
                      value={formData.valueType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="string">String</option>
                      <option >Real</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label fw-semibold">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Enter signal description (optional)"
                    />
                  </div>
                  
                  {modalError && (
                    <div className="alert alert-danger py-2">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {modalError}
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
                        Add Signal
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Signal Modal */}
      {showEditModal && editingSignal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-primary">
                  <i className="bi bi-pencil me-2"></i>
                  Edit Signal: {editingSignal.name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseModal}
                ></button>
              </div>
              
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">
                      <i className="bi bi-diagram-3 me-1"></i>
                      Asset: {assetName || `Asset ${assetId}`}
                    </label>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="editSignalName" className="form-label fw-semibold">
                      Signal Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="editSignalName"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter signal name"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="editValueType" className="form-label fw-semibold">
                      Value Type <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="editValueType"
                      name="valueType"
                      value={formData.valueType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="string">String</option>
                      <option >Real</option>
                      
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="editDescription" className="form-label fw-semibold">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      id="editDescription"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Enter signal description (optional)"
                    />
                  </div>
                  
                  {modalError && (
                    <div className="alert alert-danger py-2">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {modalError}
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
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-pencil me-2"></i>
                        Update Signal
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SignalPage;