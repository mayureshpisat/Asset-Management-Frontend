const AvgStatsIcon = ({nodeId}) => {

    const handleFetchStats = async () => {
        try{
            const response = await fetch(`https://localhost:7242/api/AssetHierarchy/GetAssetInfo/${nodeId}`,{
                method: "POST",
                credentials: "include"
            })

            
            if(!response.ok){
                throw new Error("Avg Stats Api not executed")
            }

        }catch(e){
            console.log("FROM STATS ICON")
            console.log(e);

        }

    }
    return (
          <span 
    className="bi bi-bar-chart-line ms-2"  
    style={{
      color: "#0d6efd",
      cursor: 'pointer',
      opacity: '0.2',
      fontSize: '14px',
      userSelect: 'none'
    }}
    onClick={handleFetchStats}
    
    onMouseEnter={(e) => e.target.style.opacity = '1'}
    onMouseLeave={(e) => e.target.style.opacity = '0.2'}
  />
    )
}
export default AvgStatsIcon;


