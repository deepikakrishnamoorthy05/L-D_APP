import React from 'react';
import { CERTIFICATION_SNAPSHOTS } from '../../data/mockData';
import { Award, Users, CheckCircle2 } from 'lucide-react';

export const CertificationSnapshot: React.FC = () => {
  return (
    <div className="side-widget-card">
      <div className="widget-header">
        <div className="title-with-icon">
          <Award size={16} className="widget-icon" />
          <h3 className="widget-title">Certification &amp; Upskilling</h3>
        </div>
      </div>

      <div className="cert-list">
        {CERTIFICATION_SNAPSHOTS.map((cert) => (
          <div key={cert.id} className="cert-item-card">
            <div className="cert-top-row">
              <span className="cert-code-chip">{cert.code}</span>
              <span className="cert-title">{cert.title}</span>
            </div>

            <div className="cert-stats-row">
              <div className="cert-stat">
                <Users size={12} />
                <span>{cert.preparingCount} Preparing</span>
              </div>
              <div className="cert-stat">
                <CheckCircle2 size={12} className="icon-success" />
                <span>{cert.completedThisMonth} Completed</span>
              </div>
            </div>

            <div className="cert-progress-bar">
              <div
                className="cert-progress-fill"
                style={{ width: `${cert.targetPassRate}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
