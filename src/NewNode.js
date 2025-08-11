import React, { useState } from "react";

function NewNode({ refreshHierarchy }) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    parentId: ""
  });

  // Store field-specific errors
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for the field being edited
    setErrors(prev => ({
      ...prev,
      [name]: ""
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://localhost:7242/api/AssetHierarchy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorJson = await response.json();

        // Map API errors (case-insensitive match)
        if (errorJson.errors) {
          const fieldErrors = {};
          for (const key in errorJson.errors) {
            fieldErrors[key.charAt(0).toLowerCase() + key.slice(1)] = errorJson.errors[key][0];
          }
          setErrors(fieldErrors);
        }
        return;
      }

      // Clear errors and form on success
      setErrors({});
      setFormData({
        id: "",
        name: "",
        parentId: ""
      });
      
      // Refresh hierarchy
      refreshHierarchy();
      
    } catch (error) {
      console.error("Error adding node:", error);
      setErrors({ general: "Failed to add node: " + error.message });
    }
  };

  return (
    <div className=" shadow p-4 rounded mt-4" 
    style={{
        backgroundColor: "#f9fbfd",
        border: "1px solid #e0e6ed",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}>
      <h3 className="fw-bold mb-3" style={{ color: "#0d6efd", letterSpacing: "0.5px" }}>Add New Asset Node</h3>
      {errors.general && <p className="small text-danger mb-3">{errors.general}</p>}
      <form onSubmit={handleSubmit}>
        
        {/* Node ID */}
        <div className="mb-3">
          <label className="form-label">Node ID</label>
          <input
            type="text"
            name="id"
            className={`form-control ${errors.id ? "is-invalid" : ""}`}
            value={formData.id}
            onChange={handleInputChange}
            maxLength={30}
            required
          />
          {errors.id && <div className="invalid-feedback">{errors.id}</div>}
          <p className="small text-secondary">{formData.id.length}/30</p>
        </div>

        {/* Node Name */}
        <div className="mb-3">
          <label className="form-label">Node Name</label>
          <input
            type="text"
            name="name"
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            value={formData.name}
            onChange={handleInputChange}
            maxLength={30}
            required
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          <p className="small text-secondary">{formData.name.length}/30</p>
        </div>

        {/* Parent ID */}
        <div className="mb-3">
          <label className="form-label">Parent ID</label>
          <input
            type="text"
            name="parentId"
            className={`form-control ${errors.parentId ? "is-invalid" : ""}`}
            value={formData.parentId}
            onChange={handleInputChange}
            required
          />
          {errors.parentId && <div className="invalid-feedback">{errors.parentId}</div>}
        </div>

        <button type="submit" className="btn btn-primary">
          Add Node
        </button>
      </form>
    </div>
  );
}

export default NewNode;
