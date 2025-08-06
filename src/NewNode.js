import React, { useState } from "react";

function NewNode({refreshHierarchy}) {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newNode = {
      id: id,
      name: name,
      parentId: parentId,
    };

    try {
      const response = await fetch("https://localhost:7242/api/AssetHierarchy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newNode)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      
      alert("New node added successfully!");
      refreshHierarchy();
    } catch (error) {
      console.error("Error adding node:", error);
      alert("Failed to add node: " + error.message);
    }

    // Optional: Clear the form
    setId("");
    setName("");
    setParentId("");

    // Force reload to refresh the tree fully (same as Menu)
  };

  return (
    <div className="bg-white shadow-sm p-4 rounded mt-4">
      <h3 className="text-secondary mb-3">Add New Asset Node</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Node ID</label>
          <input
            type="text"
            id="nodeId"
            className="form-control"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Node Name</label>
          <input
            type="text"
            id="nodeName"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Parent ID</label>
          <input
            type="text"
            id="parentId"
            className="form-control"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
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
