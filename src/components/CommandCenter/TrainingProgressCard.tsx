import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useBootcamps } from '../../context/BootcampContext';

interface TrainingProgressCardProps {
  onNavigate?: (navId: string) => void;
  onSelectBootcamp?: (bootcampId: string, tab?: string) => void;
}

export const TrainingProgressCard: React.FC<TrainingProgressCardProps> = ({
  onNavigate,
  onSelectBootcamp,
}) => {
  const { bootcamps } = useBootcamps();

  // Show maximum 3-4 active cohorts
  const activeCohorts = bootcamps.slice(0, 4);

  return (
    <div className="exec-ops-card">
      <div className="ops-card-header">
        <div className="ops-card-title-group">
          <BookOpen size={16} className="ops-card-icon teal" />
          <h3 className="ops-card-title">Training Progress</h3>
        </div>
        <button
          type="button"
          className="ops-card-link-btn"
          onClick={() => onNavigate?.('bootcamps')}
        >
          View Bootcamps <ArrowRight size={14} />
        </button>
      </div>

      <div className="ops-card-body">
        <div className="training-progress-list">
          {activeCohorts.map((bc) => (
            <div
              key={bc.id}
              className="progress-item-row"
              onClick={() => {
                if (onSelectBootcamp) {
                  onSelectBootcamp(bc.id, 'overview');
                } else {
                  onNavigate?.('bootcamps');
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="progress-item-meta">
                <span className="cohort-name">{bc.name}</span>
                <span className="cohort-progress-val">{bc.progressPercent}%</span>
              </div>
              <div className="compact-progress-track">
                <div
                  className="compact-progress-fill"
                  style={{ width: `${bc.progressPercent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrainingProgressCard;
