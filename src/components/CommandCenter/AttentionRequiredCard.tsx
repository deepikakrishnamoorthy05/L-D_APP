import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useTrainees } from '../../context/TraineeContext';
import { StatusBadge } from '../ui';

interface AttentionRequiredCardProps {
  onNavigate?: (navId: string, filter?: 'active' | 'project-ready' | 'needs-attention' | null) => void;
  onSelectTrainee?: (traineeId: string, tab?: string) => void;
}

export const AttentionRequiredCard: React.FC<AttentionRequiredCardProps> = ({
  onNavigate,
  onSelectTrainee,
}) => {
  const { trainees } = useTrainees();

  // Filter trainees that need attention or are at risk
  const attentionTrainees = trainees.filter(
    (t) => t.learningStatus === 'Needs Attention' || t.learningStatus === 'At Risk'
  );

  // Fallback demo items if none in state
  const displayItems =
    attentionTrainees.length > 0
      ? attentionTrainees.slice(0, 3)
      : [
          {
            id: 't-1',
            name: 'Amuthanilavan',
            employeeId: 'EMP-1021',
            bootcampName: 'Databricks & PySpark',
            learningStatus: 'Needs Attention' as const,
          },
          {
            id: 't-3',
            name: 'Aakash Duraisamy',
            employeeId: 'EMP-1034',
            bootcampName: 'Databricks & PySpark',
            learningStatus: 'At Risk' as const,
          },
        ];

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'TR';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="exec-ops-card full-width-ops-card">
      <div className="ops-card-header">
        <div className="ops-card-title-group">
          <AlertTriangle size={16} className="ops-card-icon amber" />
          <h3 className="ops-card-title">Attention Required</h3>
          <span className="attention-badge-count">{displayItems.length}</span>
        </div>
        <button
          type="button"
          className="ops-card-link-btn"
          onClick={() => onNavigate?.('trainees', 'needs-attention')}
        >
          View All <ArrowRight size={14} />
        </button>
      </div>

      <div className="ops-card-body">
        <div className="attention-trainees-list">
          {displayItems.map((item) => (
            <div
              key={item.id}
              className="attention-trainee-item"
              onClick={() => {
                if (onSelectTrainee) {
                  onSelectTrainee(item.id, 'overview');
                } else {
                  onNavigate?.('trainees', 'needs-attention');
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="trainee-avatar-initials">
                {getInitials(item.name)}
              </div>

              <div className="trainee-info-col">
                <span className="trainee-name">{item.name}</span>
                <span className="trainee-tech-sub">{item.bootcampName}</span>
              </div>

              <div className="trainee-status-col">
                <StatusBadge status={item.learningStatus} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AttentionRequiredCard;
