import React, { useState } from 'react';
import { AlertTriangle, ArrowRight, HelpCircle } from 'lucide-react';
import { useTrainees } from '../../context/TraineeContext';
import { StatusBadge } from '../ui';
import { EvidenceExplanationModal } from '../Common/EvidenceExplanationModal';

interface AttentionRequiredCardProps {
  onNavigate?: (navId: string, filter?: 'active' | 'project-ready' | 'needs-attention' | null) => void;
  onSelectTrainee?: (traineeId: string, tab?: string) => void;
}

export const AttentionRequiredCard: React.FC<AttentionRequiredCardProps> = ({
  onNavigate,
  onSelectTrainee,
}) => {
  const { trainees } = useTrainees();
  const [evidenceTraineeId, setEvidenceTraineeId] = useState<string | null>(null);

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
            id: 'te-3',
            name: 'Amuthanilavan',
            employeeId: 'EMP003',
            bootcampName: 'Python Data Engineering',
            learningStatus: 'Needs Attention' as const,
          },
          {
            id: 'te-6',
            name: 'Aakash Duraisamy',
            employeeId: 'EMP006',
            bootcampName: 'Python Data Engineering',
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

              <div className="trainee-status-col flex items-center gap-2">
                <StatusBadge status={item.learningStatus} />
                <button
                  type="button"
                  className="text-xs text-teal-700 font-bold hover:underline flex items-center gap-0.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEvidenceTraineeId(item.id);
                  }}
                  title="View evidence rationale"
                >
                  <HelpCircle size={13} /> Why?
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {evidenceTraineeId && (
        <EvidenceExplanationModal
          traineeId={evidenceTraineeId}
          onClose={() => setEvidenceTraineeId(null)}
        />
      )}
    </div>
  );
};

export default AttentionRequiredCard;
