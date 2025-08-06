import React from "react";

function Menu({ refreshHierarchy }) {
  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      alert("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("https://localhost:7242/api/AssetHierarchy/Upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg);
      }

      const message = await response.text();
      alert("Upload successful: " + message);
      //refresh to re render the asset tree
      refreshHierarchy();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed: " + error.message);
    }

    // Force reload to re-render everything
    window.location.reload();
  };

  return (
    <div className="bg-white shadow-sm p-4 rounded">
      <h3 className="text-secondary mb-3">Upload Asset Hierarchy</h3>
      <label htmlFor="upload_tree" className="form-label">Select JSON File</label>
      <input
        type="file"
        accept="application/json"
        name="upload_tree"
        id="upload_tree"
        className="form-control"
        onChange={handleFileChange}
      />
    </div>
  );
}

export default Menu;
