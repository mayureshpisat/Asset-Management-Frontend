import React, { useState } from "react";

function MergeHierarchy({ refreshHierarchy }) {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success | danger

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      setMessage("Please select a file.");
      setMessageType("warning");
      setTimeout(() => setMessage(""), 4000);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "https://localhost:7242/api/AssetHierarchy/UploadExistingTree",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errMsg = await response.text();
        setMessage(`Upload failed: ${errMsg}`);
        setMessageType("danger");
        setTimeout(() => setMessage(""), 5000);
        throw new Error(errMsg);
      }

      const msg = await response.text();
      setMessage(`✅ Upload successful: ${msg} Assets were added`);
      setMessageType("success");
      setTimeout(() => setMessage(""), 5000);
      refreshHierarchy();
    } catch (error) {
      console.error("Upload error:", error);
      setMessage(`Upload failed: ${error.message}`);
      setMessageType("danger");
      setTimeout(() => setMessage(""), 5000);
    }
  };

  return (
    <div className=" shadow-sm p-3 rounded mb-3" style={{
        backgroundColor: "#f9fbfd",
        border: "1px solid #e0e6ed",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}>
      <h5 className=" mb-3 fw-bold" style={{ color: "#0d6efd", letterSpacing: "0.5px" }} >
        <i className="bi bi-sign-merge-left me-2"></i>

         Merge Asset Hierarchy
         </h5>
      
      {/* File input */}
      <label htmlFor="upload_tree" className="form-label fw-semibold" style={{ color: "#495057" }}>
        
        Select JSON File
      </label>
      <input
        type="file"
        accept="application/json"
        name="upload_tree"
        id="upload_tree"
        className="form-control mb-3"
        onChange={handleFileChange}
      />

      {/* Styled alert message */}
      {message && (
        <div
          className={`alert alert-${messageType} mt-2 mb-0 py-2 px-3`}
          style={{
            fontSize: "0.9rem",
            fontWeight: "500",
            borderRadius: "6px",
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}

export default MergeHierarchy;
