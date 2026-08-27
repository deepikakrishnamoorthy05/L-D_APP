import React from 'react';
import { TRAINEES_ATTENTION, TraineeAttentionItem } from '../../data/mockData';
import { AlertCircle, UserX, ArrowRight } from 'lucide-react';

export const TraineesAttentionTable: React.FC = () => {
  const getRiskBadge = (risk: TraineeAttentionItem['riskLevel']) => {
    switch (risk) {
      case 'High':
        return <span className="risk-tag risk-high">High Risk</span>;
      case 'Medium':
        return <span className="risk-tag risk-medium">Medium Risk</span>;
      case 'Low':
        return <span className="risk-tag risk-low">Low Risk</span>;
    }
  };

  return (
    <div className="trainees-attention-card">
      <div className="card-title-header">
        <div className="title-with-icon">
          <AlertCircle size={18} className="header-icon icon-warning" />
          <h2 className="section-card-title">Trainees Requiring Attention</h2>
        </div>
        <span className="count-pill">12 Requiring Support</span>
      </div>

      <div className="table-responsive-wrapper">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Trainee</th>
              <th>Batch</th>
              <th>Primary Skill Gap</th>
              <th>Progress</th>
              <th>Risk Level</th>
              <th>Recommended Action</th>
            </tr>
          </thead>
          <tbody>
            {TRAINEES_ATTENTION.map((t) => (
              <tr key={t.id} className="table-row-hover">
                <td className="trainee-cell">
                  <div className="trainee-avatar-placeholder">
                    <UserX size={14} />
                  </div>
                  <div className="trainee-name-block">
                    <span className="trainee-code">{t.traineeCode}</span>
                    <span className="trainee-active-time">{t.lastActive}</span>
                  </div>
                </td>

                <td className="batch-cell">{t.batch}</td>

                <td className="skill-gap-cell">
                  <span className="skill-gap-badge">{t.primarySkillGap}</span>
                </td>

                <td className="progress-cell">
                  <div className="progress-flex">
                    <div className="mini-progress-track">
                      <div
                        className={`mini-progress-fill ${t.progressPercent < 70 ? 'fill-low' : 'fill-cyan'}`}
                        style={{ width: `${t.progressPercent}%` }}
                      />
                    </div>
                    <span className="progress-num">{t.progressPercent}%</span>
                  </div>
                </td>

                <td className="risk-cell">{getRiskBadge(t.riskLevel)}</td>

                <td className="action-cell">
                  <button
                    type="button"
                    className="action-link-btn"
                    onClick={() => alert(`Assigning Action: "${t.recommendedAction}" to ${t.traineeCode}`)}
                  >
                    <span>{t.recommendedAction}</span>
                    <ArrowRight size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
