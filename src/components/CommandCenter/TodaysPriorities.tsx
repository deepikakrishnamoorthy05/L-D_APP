import React from 'react';
import { MessageSquare, AlertTriangle, CheckSquare, GitBranch, ArrowRight } from 'lucide-react';
import { useTrainees } from '../../context/TraineeContext';

interface TodaysPrioritiesProps {
  onNavigate?: (navId: string, filter?: 'active' | 'project-ready' | 'needs-attention' | null) => void;
}

export const TodaysPriorities: React.FC<TodaysPrioritiesProps> = ({ onNavigate }) => {
  const { trainees } = useTrainees();

  const attentionCount = trainees.filter(
    (t) => t.learningStatus === 'Needs Attention' || t.learningStatus === 'At Risk'
  ).length || 2;

  const priorities = [
    {
      id: 'p-feedback',
      title: 'Trainer Feedback Pending',
      description: '3 submissions awaiting review',
      count: 3,
      buttonText: 'Review',
      icon: <MessageSquare size={18} className="priority-icon cyan" />,
      action: () => onNavigate?.('feedback'),
    },
    {
      id: 'p-intervention',
      title: 'Trainees Needing Intervention',
      description: `${attentionCount} trainees require L&D support`,
      count: attentionCount,
      buttonText: 'View',
      icon: <AlertTriangle size={18} className="priority-icon amber" />,
      action: () => onNavigate?.('trainees', 'needs-attention'),
    },
    {
      id: 'p-assessment',
      title: 'Assessment Review',
      description: '1 assessment requires evaluation',
      count: 1,
      buttonText: 'Review',
      icon: <CheckSquare size={18} className="priority-icon indigo" />,
      action: () => onNavigate?.('assessments'),
    },
    {
      id: 'p-track-allocation',
      title: 'Track Allocation Decisions',
      description: '4 track allocation decisions pending',
      count: 4,
      buttonText: 'Decide',
      icon: <GitBranch size={18} className="priority-icon green" />,
      action: () => onNavigate?.('bootcamps'),
    },
  ];

  return (
    <div id="todays-priorities" className="exec-ops-card priorities-card">
      <div className="ops-card-header">
        <div className="ops-card-title-group">
          <h3 className="ops-card-title">Today's Priorities</h3>
          <span className="priority-header-subtitle">Actions requiring L&amp;D attention today</span>
        </div>
      </div>

      <div className="ops-card-body">
        <div className="priorities-action-list">
          {priorities.map((item) => (
            <div
              key={item.id}
              className="priority-row-item"
              onClick={item.action}
              role="button"
              tabIndex={0}
            >
              <div className="priority-item-left">
                <div className="priority-icon-box">{item.icon}</div>
                <div className="priority-text-block">
                  <span className="priority-title">{item.title}</span>
                  <span className="priority-desc">{item.description}</span>
                </div>
              </div>

              <div className="priority-item-right">
                <span className="priority-count-badge">{item.count}</span>
                <button
                  type="button"
                  className="priority-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    item.action();
                  }}
                >
                  <span>{item.buttonText}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TodaysPriorities;
