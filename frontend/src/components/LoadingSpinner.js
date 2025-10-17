import React from 'react';
import '../styles/Spinner.css'; // We will create this file next

// A simple, reusable loading spinner component
function LoadingSpinner() {
  return (
    <div className="spinner-overlay">
      <div className="loading-spinner"></div>
    </div>
  );
}

export default LoadingSpinner;
