import React from "react";

function Download(){

const handleBlob = async (format) => {
try{
const response = await fetch(`https://localhost:7242/api/AssetHierarchy/DownloadFile/${format}`, {
method : "GET"
})

const blob = await response.blob();

// Create a download link
const url = window.URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = `assets.${format}`; // Set the filename
document.body.appendChild(link);
link.click();

// Clean up
document.body.removeChild(link);
window.URL.revokeObjectURL(url);

}
catch(error){
console.log(error)

}


}

return(
<div
className="position-relative"
style={{
border: "2px dashed #16a34a",
borderRadius: "8px",
backgroundColor: "#f0fdf4",
padding: "1rem",
textAlign: "center",
cursor: "pointer",
transition: "all 0.3s ease"
}}

onClick={() => handleBlob('json')}
>
<i className="bi bi-download text-success mb-2 d-block" style={{ fontSize: "1.5rem" }}></i>
<div className="fw-semibold text-dark small">Download JSON</div>
<div className="text-muted" style={{ fontSize: "0.75rem" }}>
Click to download hierarchy
</div>
</div>
)
}

export default Download;