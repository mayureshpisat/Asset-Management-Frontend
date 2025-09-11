import React from "react";
import Download from "./Download.js";
import { useAuth } from "../context/AuthContext.js";
import { useEffect } from "react";

function Menu({ refreshHierarchy, fetchTotalAssets}) {
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);
  const {getAuthHeaders,user} = useAuth();

  // Use useEffect for timeouts to avoid memory leaks and timing issues
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const userRole = user.role;

  if(userRole === "Viewer"){
    return (<Download/>)
  }
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    
    // Clear previous messages
    setErrorMessage("");
    setSuccessMessage("");
    
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("https://localhost:7242/api/AssetHierarchy/Upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errMsg = await response.text();
        setErrorMessage("Error ❌: " + errMsg);
        console.log(errMsg);
      } else {
        const message = await response.text();
        setSuccessMessage("✅ Upload successful: " + message);
        refreshHierarchy();
        fetchTotalAssets();
      }
    } catch (error) {
      console.log(error);
      setErrorMessage("Error ❌: Network error occurred");
    } finally {
      setIsUploading(false);
      // Reset the file input to allow selecting the same file again
      e.target.value = '';
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
        <i
          className="bi bi-cloud-upload me-2"
          style={{ fontSize: "1.2rem", color: "#3b82f6" }}
        ></i>
        Upload Hierarchy
      </h5>

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
          cursor: isUploading ? "not-allowed" : "pointer",
          transition: "all 0.3s ease",
          opacity: isUploading ? 0.7 : 1
        }}
        onMouseEnter={(e) => {
          if (!isUploading) {
            e.target.style.borderColor = "#3b82f6";
            e.target.style.backgroundColor = "#eff6ff";
          }
        }}
        onMouseLeave={(e) => {
          if (!isUploading) {
            e.target.style.borderColor = "#cbd5e1";
            e.target.style.backgroundColor = "#f8fafc";
          }
        }}
      >
        <input
          type="file"
          accept="application/json"
          name="upload_tree"
          id="upload_tree"
          className="position-absolute opacity-0 w-100 h-100"
          onChange={handleFileChange}
          disabled={isUploading}
          style={{
            cursor: isUploading ? "not-allowed" : "pointer",
            top: 0,
            left: 0
          }}
        />
        
        {isUploading ? (
          <>
            <i className="bi bi-arrow-clockwise text-primary mb-2 d-block spinner-border spinner-border-sm"></i>
            <div className="fw-semibold text-dark small">Uploading...</div>
          </>
        ) : (
          <>
            <i
              className="bi bi-file-earmark-arrow-up text-primary mb-2 d-block"
              style={{ fontSize: "1.5rem" }}
            ></i>
            <div className="fw-semibold text-dark small">Click to select file</div>
            <div className="text-muted" style={{ fontSize: "0.75rem" }}>
              JSON files only
            </div>
          </>
        )}
      </div>

      {errorMessage && (
        <div
          className="alert border-0 py-2 px-3 mb-3 small"
          style={{
            fontSize: "0.8rem",
            backgroundColor: "#fef2f2",
            color: "#dc2626",
            borderLeft: "3px solid #dc2626",
            borderRadius: "4px"
          }}
        >
          <i className="bi bi-exclamation-triangle me-1"></i>
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          className="alert border-0 py-2 px-3 mb-3 small"
          style={{
            fontSize: "0.8rem",
            backgroundColor: "#f0fdf4",
            color: "#16a34a",
            borderLeft: "3px solid #16a34a",
            borderRadius: "4px"
          }}
        >
          <i className="bi bi-check-circle me-1"></i>
          {successMessage}
        </div>
      )}

      <div className="mt-2">
        <Download />
      </div>
    </div>
  );
}

export default Menu;