import React from "react";
import Download from "./Download";

function Menu({ refreshHierarchy }) {
  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("https://localhost:7242/api/AssetHierarchy/Upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errMsg = await response.text();
        setErrorMessage("Error ❌: " + errMsg);
        console.log(errMsg)
      }

      const message = await response.text();
      setSuccessMessage("✅ Upload successful: " + message);
      refreshHierarchy();
    } catch (error) {
      console.log(error)
    }
  };

  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");

  setTimeout(()=>setSuccessMessage(""), 4000);
  setTimeout(()=>setErrorMessage(""), 4000);

  return (
    <div
      className="shadow-sm p-3 rounded mb-3"
      style={{
        backgroundColor: "#f9fbfd",
        border: "1px solid #e0e6ed",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h5
        className="fw-bold mb-3 text-primary"
        style={{ letterSpacing: "0.5px" }}
      >
        <i className="bi bi-upload me-2"></i>
        Upload Hierarchy
      </h5>

      <label
        htmlFor="upload_tree"
        className="form-label fw-semibold small"
        style={{ color: "#495057" }}
      >
        Select JSON File
      </label>

      <input
        type="file"
        accept="application/json"
        name="upload_tree"
        id="upload_tree"
        className="form-control form-control-sm mb-3"
        onChange={handleFileChange}
        style={{
          borderColor: "#ced4da",
          cursor: "pointer",
        }}
      />

      {errorMessage && (
        <div
          className="alert alert-danger py-1 small"
          style={{ fontSize: "0.8rem" }}
        >
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          className="alert alert-success py-1 small"
          style={{ fontSize: "0.8rem" }}
        >
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