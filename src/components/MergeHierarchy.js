import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

function MergeHierarchy({ refreshHierarchy,fetchTotalAssets }) {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success | danger
  const {getAuthHeaders,user} = useAuth();
  const userRole = user.role;

  if(userRole === "Viewer"){
    return null;
  }
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
          headers: getAuthHeaders(true),
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
      fetchTotalAssets();
    } catch (error) {
      console.error("Upload error:", error);
      setMessage(`Upload failed: ${error.message}`);
      setMessageType("danger");
      setTimeout(() => setMessage(""), 5000);
    }
  };

  return (
    <div 
      className="shadow-sm p-3 rounded mb-3" 
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h5 
        className="fw-bold mb-3 d-flex align-items-center" 
        style={{ 
          letterSpacing: "0.5px",
          fontSize: "1.1rem",
          color: "#1e40af"
        }}
      >
        <i className="bi bi-sign-merge-left me-2" style={{ fontSize: "1.2rem", color: "#3b82f6" }}></i>
        Merge Asset Hierarchy
      </h5>
      
      {/* File input */}
      <label 
        htmlFor="upload_tree" 
        className="form-label fw-semibold small"
        style={{ color: "#64748b" }}
      >
        Select JSON File
      </label>
      
      <div 
        className="position-relative mb-3"
        style={{
          border: "2px dashed #cbd5e1",
          borderRadius: "8px",
          backgroundColor: "#f8fafc",
          padding: "1rem",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.3s ease"
        }}
        onMouseEnter={(e) => {
          e.target.style.borderColor = "#3b82f6";
          e.target.style.backgroundColor = "#eff6ff";
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = "#cbd5e1";
          e.target.style.backgroundColor = "#f8fafc";
        }}
      >
        <input
          type="file"
          accept="application/json"
          name="upload_tree"
          id="upload_tree"
          className="position-absolute opacity-0 w-100 h-100"
          onChange={handleFileChange}
          style={{
            cursor: "pointer",
            top: 0,
            left: 0
          }}
        />
        <i className="bi bi-file-earmark-code text-primary mb-2 d-block" style={{ fontSize: "1.5rem" }}></i>
        <div className="fw-semibold text-dark small">Click to select file</div>
        <div className="text-muted" style={{ fontSize: "0.75rem" }}>JSON files only</div>
      </div>

      {/* Styled alert message */}
      {message && (
        <div
          className="border-0 py-2 px-3 mb-0 small"
          style={{
            fontSize: "0.8rem",
            backgroundColor: messageType === "success" 
              ? "#f0fdf4" 
              : messageType === "danger" 
                ? "#fef2f2"
                : "#fefce8",
            color: messageType === "success" 
              ? "#16a34a" 
              : messageType === "danger" 
                ? "#dc2626"
                : "#ca8a04",
            borderLeft: `3px solid ${
              messageType === "success" 
                ? "#16a34a" 
                : messageType === "danger" 
                  ? "#dc2626"
                  : "#ca8a04"
            }`,
            borderRadius: "4px"
          }}
        >
          <i 
            className={`me-1 ${
              messageType === "success" 
                ? "bi bi-check-circle" 
                : messageType === "danger" 
                  ? "bi bi-exclamation-triangle"
                  : "bi bi-info-circle"
            }`}
          ></i>
          {message}
        </div>
      )}
    </div>
  );
}

export default MergeHierarchy;