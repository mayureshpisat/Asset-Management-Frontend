import React from "react";
import Download from "./Download";

function Menu({ refreshHierarchy }) {
  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      setErrorMessage("Please select a file.");
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
      setSuccessMessage("✅ Upload successful: " + message);
      refreshHierarchy();
    } catch (error) {
      setErrorMessage("❌ Upload failed: " + error.message);
    }
  };

  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");

  return (
    <div
      className="shadow p-4 rounded"
      style={{
        backgroundColor: "#f9fbfd",
        border: "1px solid #e0e6ed",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h3
        className="fw-bold mb-3"
        style={{ color: "#0d6efd", letterSpacing: "0.5px" }}
      >
        Upload Asset Hierarchy
      </h3>

      <label
        htmlFor="upload_tree"
        className="form-label fw-semibold"
        style={{ color: "#495057" }}
      >
        Select JSON File
      </label>

      <input
        type="file"
        accept="application/json"
        name="upload_tree"
        id="upload_tree"
        className="form-control mb-3"
        onChange={handleFileChange}
        style={{
          borderColor: "#ced4da",
          cursor: "pointer",
        }}
      />

      {errorMessage && (
        <div
          className="alert alert-danger py-2"
          style={{ fontSize: "0.9rem" }}
        >
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          className="alert alert-success py-2"
          style={{ fontSize: "0.9rem" }}
        >
          {successMessage}
        </div>
      )}

      <div className="mt-3">
        <Download />
      </div>
    </div>
  );
}

export default Menu;
