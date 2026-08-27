import React from 'react';
import { BOOTCAMP_PERFORMANCE_DOMAINS, BootcampDomain } from '../../data/mockData';
import { Layers, AlertCircle, CheckCircle2, Award } from 'lucide-react';

export const BootcampPerformance: React.FC = () => {
  const getStatusBadge = (status: BootcampDomain['status']) => {
    switch (status) {
      case 'EXCELLENT':
        return (
          <span className="domain-status-badge status-excellent">
            <CheckCircle2 size={12} />
            <span>Excellent</span>
          </span>
        );
      case 'ON_TRACK':
        return (
          <span className="domain-status-badge status-ontrack">
            <Award size={12} />
            <span>On Track</span>
          </span>
        );
      case 'NEEDS_ATTENTION':
        return (
          <span className="domain-status-badge status-attention">
            <AlertCircle size={12} />
            <span>Needs Attention</span>
          </span>
        );
    }
  };

  return (
    <div className="bootcamp-perf-card">
      <div className="card-title-header">
        <div className="title-with-icon">
          <Layers size={18} className="header-icon" />
          <h2 className="section-card-title">Bootcamp Performance</h2>
        </div>
        <span className="domain-count-tag">4 Active Cohorts</span>
      </div>

      <div className="domains-list">
        {BOOTCAMP_PERFORMANCE_DOMAINS.map((domain) => (
          <div key={domain.id} className="domain-row">
            {/* Domain Info */}
            <div className="domain-info-block">
              <div className="domain-name-row">
                <span className="domain-name">{domain.name}</span>
                <span className="domain-code">{domain.code}</span>
              </div>
              <div className="domain-trainees-count">
                {domain.traineesCount} Trainees Enrolled
              </div>
            </div>

            {/* Metrics Visual Bars */}
            <div className="domain-metrics-grid">
              {/* Avg Score */}
              <div className="metric-bar-group">
                <div className="metric-bar-label">
                  <span>Avg Score</span>
                  <span className="bar-val">{domain.avgScore}%</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${domain.avgScore}%` }}
                  />
                </div>
              </div>

              {/* Completion Rate */}
              <div className="metric-bar-group">
                <div className="metric-bar-label">
                  <span>Completion</span>
                  <span className="bar-val">{domain.completionRate}%</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill fill-cyan-subtle"
                    style={{ width: `${domain.completionRate}%` }}
                  />
                </div>
              </div>

              {/* Attendance Rate */}
              <div className="metric-bar-group">
                <div className="metric-bar-label">
                  <span>Attendance</span>
                  <span className="bar-val">{domain.attendanceRate}%</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${domain.attendanceRate}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Domain Status Tag */}
            <div className="domain-status-block">
              {getStatusBadge(domain.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
