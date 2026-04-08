import React from 'react';
import './CustomLoadingOverlay.scss';

const CustomLoadingOverlay = ({ active = false, text = 'Loading...' }) => {
  if (!active) return null;

  return (
    <div className="custom-loading-overlay">
      <div className="loading-content">
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        {text && <p className="loading-text">{text}</p>}
      </div>
    </div>
  );
};

export default CustomLoadingOverlay;
