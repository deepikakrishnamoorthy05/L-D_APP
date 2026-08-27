import React from 'react';

interface CircularProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label: string;
}

export const CircularProgressRing: React.FC<CircularProgressRingProps> = ({
  percentage,
  size = 110,
  strokeWidth = 9,
  color = 'var(--color-primary, #38E8D4)',
  label,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="circular-progress-ring-card">
      <div className="svg-ring-wrapper" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="circular-progress-svg">
          {/* Background circle track */}
          <circle
            className="ring-bg-track"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          {/* Foreground animated value stroke */}
          <circle
            className="ring-value-stroke"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        <div className="ring-center-content">
          <span className="ring-percent-num">{percentage}%</span>
        </div>
      </div>

      <span className="ring-label-text">{label}</span>
    </div>
  );
};
