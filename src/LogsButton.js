import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

function LogsButton({ refreshHierarchy }) {
  const navigate = useNavigate();

  const handleClick = () => {
    refreshHierarchy(); 
    navigate('/logs');
  };

  return (
    <div className="mt-3">
      <button className='btn btn-primary' onClick={handleClick}>
          VIew Import Logs
      </button>
    </div>
  );
}

export default LogsButton;
