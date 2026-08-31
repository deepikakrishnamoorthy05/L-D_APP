import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useTrainees } from '../../context/TraineeContext';

interface DailyBriefCardProps {
  onNavigate?: (navId: string) => void;
}

export const DailyBriefCard: React.FC<DailyBriefCardProps> = ({ onNavigate }) => {
  const { trainees } = useTrainees();

  const readyCount = trainees.filter((t) => t.learningStatus === 'Project Ready').length || 10;
  const attentionCount = trainees.filter(
    (t) => t.learningStatus === 'Needs Attention' || t.learningStatus === 'At Risk'
  ).length || 2;

  const briefPoints = [
    `${readyCount} trainees are currently project ready for deployment.`,
    `${attentionCount} trainees need immediate attention and targeted intervention.`,
    `4 trainees are awaiting track allocation decisions.`,
    `Python Data Engineering currently has the lowest completion rate (76%).`,
  ];

  return (
    <div className="exec-ops-card daily-brief-card">
      <div className="ops-card-header">
        <div className="ops-card-title-group">
          <Sparkles size={16} className="ops-card-icon cyan-sparkle" />
          <h3 className="ops-card-title">L&amp;D Daily Brief</h3>
        </div>
        <span className="ai-generated-badge">
          <span className="cyan-pulse-dot" /> AI Generated
        </span>
      </div>

      <div className="ops-card-body flex-1 flex flex-col justify-between">
        <ul className="daily-brief-points-list">
          {briefPoints.map((point, idx) => (
            <li key={idx} className="brief-point-item">
              <span className="bullet-dot">•</span>
              <span className="point-text">{point}</span>
            </li>
          ))}
        </ul>

        <div className="ops-card-footer mt-4 pt-3 border-t">
          <button
            type="button"
            className="ops-card-link-btn"
            onClick={() => onNavigate?.('skill-intelligence')}
          >
            View Intelligence <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyBriefCard;
