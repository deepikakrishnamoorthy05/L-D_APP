import React from 'react';

interface IntelligenceOrbProps {
  size?: number;
  className?: string;
}

export const IntelligenceOrb: React.FC<IntelligenceOrbProps> = ({
  size = 42,
  className = '',
}) => {
  return (
    <div className={`intelligence-orb-container ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" className="intelligence-orb-svg">
        <defs>
          <radialGradient id="orbTealGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#38E8D4" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#1E8282" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#102A33" stopOpacity="0.05" />
          </radialGradient>
          <linearGradient id="orbitStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38E8D4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#7C8CFF" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Central Glowing Sphere */}
        <circle cx="50" cy="50" r="28" fill="url(#orbTealGrad)" className="orb-center-sphere" />

        {/* Orbit Ring 1 */}
        <ellipse
          cx="50"
          cy="50"
          rx="42"
          ry="18"
          fill="none"
          stroke="url(#orbitStroke)"
          strokeWidth="1.8"
          className="orb-ring ring-1"
        />

        {/* Orbit Ring 2 */}
        <ellipse
          cx="50"
          cy="50"
          rx="18"
          ry="42"
          fill="none"
          stroke="url(#orbitStroke)"
          strokeWidth="1.8"
          className="orb-ring ring-2"
        />

        {/* Glowing Nodes */}
        <circle cx="20" cy="50" r="3" fill="#38E8D4" className="orb-node node-a" />
        <circle cx="50" cy="18" r="3" fill="#7C8CFF" className="orb-node node-b" />
        <circle cx="80" cy="50" r="3" fill="#38E8D4" className="orb-node node-c" />
      </svg>
    </div>
  );
};
