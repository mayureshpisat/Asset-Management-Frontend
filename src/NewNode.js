import React, { useState } from "react";

function NewNode({ refreshHierarchy }) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    parentId: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
        const errorText = await response.text();
        alert(errorText)
      }

      // alert("Node added successfully!");
      
      // Clear form
      setFormData({
        id: "",
        name: "",
        parentId: ""
      });
      
      // Refresh the hierarchy
      refreshHierarchy();
      
    } catch (error) {
      console.error("Error adding node:", error);
      alert("Failed to add node: " + error.message);
    }
  };

  return (
    <div className="bg-white shadow-sm p-4 rounded mt-4">
      <h3 className="text-secondary mb-3">Add New Asset Node</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Node ID</label>
          <input
            type="text"
            name="id"
            className="form-control"
            value={formData.id}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Node Name</label>
          <input
            type="text"
            name="name"
            className="form-control"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Parent ID</label>
          <input
            type="text"
            name="parentId"
            className="form-control"
            value={formData.parentId}
            onChange={handleInputChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Add Node
        </button>
      </form>
    </div>
  );
}

export default NewNode;