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
        <div className="pt-4">
            <button 
                    className="btn btn-success me-2" 
                    onClick={() => handleBlob('json')}
                >
                    Download JSON
            </button>
        </div>
    )
}

export default Download;