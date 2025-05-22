import React from 'react';
import './ProgressIndicator.css';

function ProgressIndicator({ current, total }) {
  const percentage = Math.round((current / total) * 100);
  
  return (
    <div className="progress-indicator">
      <div className="progress-text">
        <span className="current">{current}</span>
        <span className="separator"> / </span>
        <span className="total">{total}</span>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

export default ProgressIndicator;