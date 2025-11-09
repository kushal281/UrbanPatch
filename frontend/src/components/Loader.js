import React from 'react';

const Loader = ({ size = 'medium', fullscreen = false }) => {
  const sizeClasses = {
    small: 'spinner-sm',
    medium: 'spinner-md',
    large: 'spinner-lg',
  };

  if (fullscreen) {
    return (
      <div className="loader-fullscreen">
        <div className={`spinner ${sizeClasses[size]}`}></div>
        <p className="mt-3 text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="loader-container">
      <div className={`spinner ${sizeClasses[size]}`}></div>
    </div>
  );
};

export default Loader;