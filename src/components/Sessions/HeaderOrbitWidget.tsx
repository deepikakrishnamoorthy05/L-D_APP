import React from 'react';

export const HeaderOrbitWidget: React.FC = () => {
  return (
    <div className="header-orbit-widget-container">
      <svg className="header-orbit-svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" className="header-orbit-ring ring-1" />
        <circle cx="50" cy="50" r="26" className="header-orbit-ring ring-2" />
        <circle cx="50" cy="50" r="12" className="header-orbit-core" />
      </svg>
      <div className="header-orbit-rotating-group">
        <span className="h-node n1" />
        <span className="h-node n2" />
        <span className="h-node n3" />
      </div>
    </div>
  );
};
