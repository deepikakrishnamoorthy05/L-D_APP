import React, { useState } from 'react';
import { LEARNING_OVERVIEW_SERIES } from '../../data/mockData';
import { TrendingUp, BarChart2, CheckCircle2 } from 'lucide-react';

type MetricType = 'overall' | 'assessment' | 'assignment';

export const LearningOverviewChart: React.FC = () => {
  const [activeMetric, setActiveMetric] = useState<MetricType>('overall');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const getMetricData = (type: MetricType) => {
    return LEARNING_OVERVIEW_SERIES.map((item) => ({
      week: item.week,
      value: item[type],
    }));
  };

  const currentSeries = getMetricData(activeMetric);

  // SVG Chart Dimensions
  const width = 650;
  const height = 310;
  const paddingX = 40;
  const paddingY = 35;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const minVal = 30;
  const maxVal = 100;

  const getX = (index: number) => {
    return paddingX + (index / (currentSeries.length - 1)) * chartWidth;
  };

  const getY = (value: number) => {
    const norm = (value - minVal) / (maxVal - minVal);
    return height - paddingY - norm * chartHeight;
  };

  // Generate SVG Path d string for smooth line curve
  const points = currentSeries.map((d, i) => [getX(i), getY(d.value)]);
  const pathD = points.reduce((acc, point, i, a) => {
    if (i === 0) return `M ${point[0]},${point[1]}`;
    const prev = a[i - 1];
    const cx = (prev[0] + point[0]) / 2;
    return `${acc} C ${cx},${prev[1]} ${cx},${point[1]} ${point[0]},${point[1]}`;
  }, '');

  // Closed area path string for gradient fill under the line
  const areaD = `${pathD} L ${points[points.length - 1][0]},${height - paddingY} L ${points[0][0]},${height - paddingY} Z`;

  const getMetricLabel = () => {
    switch (activeMetric) {
      case 'overall':
        return 'Overall Progress';
      case 'assessment':
        return 'Assessment Performance';
      case 'assignment':
        return 'Assignment Completion';
    }
  };

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div className="chart-title-block">
          <div className="title-with-icon">
            <TrendingUp size={18} className="header-icon" />
            <h2 className="section-card-title">Learning Progress Overview</h2>
          </div>
          <p className="chart-subtitle">
            Tracking weekly trainee progression across core L&amp;D milestones.
          </p>
        </div>

        {/* Metric Switcher Tabs */}
        <div className="metric-tabs">
          <button
            type="button"
            className={`metric-tab-btn ${activeMetric === 'overall' ? 'active' : ''}`}
            onClick={() => setActiveMetric('overall')}
          >
            <TrendingUp size={14} />
            <span>Overall</span>
          </button>

          <button
            type="button"
            className={`metric-tab-btn ${activeMetric === 'assessment' ? 'active' : ''}`}
            onClick={() => setActiveMetric('assessment')}
          >
            <BarChart2 size={14} />
            <span>Assessments</span>
          </button>

          <button
            type="button"
            className={`metric-tab-btn ${activeMetric === 'assignment' ? 'active' : ''}`}
            onClick={() => setActiveMetric('assignment')}
          >
            <CheckCircle2 size={14} />
            <span>Assignments</span>
          </button>
        </div>
      </div>

      {/* SVG Line / Area Graph */}
      <div className="svg-chart-wrapper">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="overview-svg-chart"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Electric Cyan Gradient Fill */}
            <linearGradient id="cyanAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.0" />
            </linearGradient>

            {/* Glowing Line Shadow */}
            <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#00f0ff" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Grid Lines */}
          {[40, 60, 80, 100].map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="rgba(0, 240, 255, 0.07)"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 10}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="end"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Area Gradient Under Curve */}
          <path d={areaD} fill="url(#cyanAreaGradient)" />

          {/* Main Curve Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#00f0ff"
            strokeWidth="3"
            filter="url(#cyanGlow)"
          />

          {/* Data Points */}
          {points.map((pt, i) => {
            const isHovered = hoveredPointIndex === i;
            return (
              <g key={i} className="chart-data-point-group">
                <circle
                  cx={pt[0]}
                  cy={pt[1]}
                  r={isHovered ? 6 : 4}
                  fill="#05070a"
                  stroke="#00f0ff"
                  strokeWidth={isHovered ? 3 : 2}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onMouseEnter={() => setHoveredPointIndex(i)}
                  onMouseLeave={() => setHoveredPointIndex(null)}
                />

                {/* X-Axis Labels */}
                <text
                  x={pt[0]}
                  y={height - 8}
                  fill={isHovered ? '#00f0ff' : '#94a3b8'}
                  fontSize="11"
                  fontWeight={isHovered ? '700' : '500'}
                  textAnchor="middle"
                >
                  {currentSeries[i].week}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPointIndex !== null && (
          <div
            className="chart-hover-tooltip"
            style={{
              left: `${(points[hoveredPointIndex][0] / width) * 100}%`,
              top: `${(points[hoveredPointIndex][1] / height) * 100 - 15}%`,
            }}
          >
            <div className="tooltip-header">{currentSeries[hoveredPointIndex].week}</div>
            <div className="tooltip-body">
              <span className="tooltip-label">{getMetricLabel()}:</span>
              <span className="tooltip-value">{currentSeries[hoveredPointIndex].value}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Chart Footer Summary Metric */}
      <div className="chart-footer-bar">
        <div className="metric-stat">
          <span className="stat-label">Current Avg Performance:</span>
          <span className="stat-value">
            {currentSeries[currentSeries.length - 1].value}%
          </span>
        </div>
        <div className="metric-stat">
          <span className="stat-label">Weekly Growth Velocity:</span>
          <span className="stat-value positive">+4.2% / week</span>
        </div>
      </div>
    </div>
  );
};
