import React from 'react';
import '../styles/Preloader.css';

// THE FIX: We add { className } here to accept the instruction from App.js
function Preloader({ className }) {
  return (
    // THE FIX: We apply the className to the main div
    <div className={`preloader ${className}`}>
      <div className="preloader-logo">
        <svg width="80" height="80" viewBox="0 0 100 100">
          <path 
            className="leaf"
            fill="var(--accent-color)" 
            d="M50 0 C65 10, 70 25, 50 50 C30 25, 35 10, 50 0 Z" 
          />
          <path 
            className="stem"
            stroke="var(--accent-color)" 
            strokeWidth="4" 
            d="M50 50 V100" 
          />
        </svg>
      </div>
      <p>Smart Crop Monitor</p>
    </div>
  );
}

export default Preloader;

