import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useTrainees } from '../../context/TraineeContext';

interface DailyBriefCardProps {
  onNavigate?: (navId: string, filter?: any) => void;
}

export const DailyBriefCard: React.FC<DailyBriefCardProps> = ({ onNavigate }) => {
  const { trainees } = useTrainees();

  const readyCount = trainees.filter((t) => t.learningStatus === 'Project Ready').length || 10;
  const attentionCount =
    trainees.filter(
      (t) => t.learningStatus === 'Needs Attention' || t.learningStatus === 'At Risk'
    ).length || 2;

  const briefPoints = [
    `${readyCount} trainees are currently project ready.`,
    `${attentionCount} trainees require immediate attention.`,
    `4 trainees are waiting for track allocation.`,
    `Databricks is currently one of the main development areas.`,
  ];

  return (
    <div className="exec-ops-card daily-brief-card flex flex-col justify-between">
      <div>
        <div className="ops-card-header flex items-center justify-between pb-2 mb-3 border-b">
          <div className="ops-card-title-group flex items-center gap-2">
            <Sparkles size={16} className="ops-card-icon text-teal-600" />
            <h3 className="ops-card-title font-extrabold text-sm uppercase tracking-wider">
              L&amp;D DAILY BRIEF
            </h3>
          </div>
          <span className="ai-generated-badge inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" /> AI ASSISTED
          </span>
        </div>

        {/* 3-4 Concise Insights */}
        <ul className="daily-brief-points-list space-y-2 mb-3">
          {briefPoints.map((point, idx) => (
            <li key={idx} className="brief-point-item flex items-start gap-2 text-xs text-slate-700">
              <span className="bullet-dot font-black text-teal-600">•</span>
              <span className="point-text font-medium">{point}</span>
            </li>
          ))}
        </ul>

        {/* Recommended Actions */}
        <div className="recommended-actions-block">
          <span className="rec-actions-title">RECOMMENDED ACTIONS</span>
          <div className="rec-actions-list">
            <button
              type="button"
              className="rec-action-tile"
              onClick={() => onNavigate?.('trainees', 'needs-attention')}
            >
              <ArrowRight size={13} className="rec-action-icon" />
              <span>Review trainees requiring attention</span>
            </button>
            <button
              type="button"
              className="rec-action-tile"
              onClick={() => onNavigate?.('skill-intelligence')}
            >
              <ArrowRight size={13} className="rec-action-icon" />
              <span>Review pending track allocation</span>
            </button>
            <button
              type="button"
              className="rec-action-tile"
              onClick={() => onNavigate?.('bootcamps')}
            >
              <ArrowRight size={13} className="rec-action-icon" />
              <span>Plan focused Databricks reinforcement</span>
            </button>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="ops-card-footer mt-3 pt-2 border-t flex items-center justify-between">
        <span className="disclaimer-note-xs text-[11px] text-slate-400 font-medium">
          Recommendation for L&amp;D review
        </span>
        <button
          type="button"
          className="ops-card-link-btn inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:underline"
          onClick={() => onNavigate?.('skill-intelligence')}
        >
          View Intelligence <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};

export default DailyBriefCard;
