import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';

interface UpcomingMilestonesCardProps {
  onNavigate?: (navId: string) => void;
}

export const UpcomingMilestonesCard: React.FC<UpcomingMilestonesCardProps> = ({ onNavigate }) => {
  const milestones = [
    {
      id: 'm-1',
      month: 'SEP',
      day: '05',
      title: 'SQL Data Architecture Cohort Completion',
      category: 'Cohort Completion',
    },
    {
      id: 'm-2',
      month: 'SEP',
      day: '08',
      title: 'DP-700 Certification Readiness Review',
      category: 'Certification Review',
    },
    {
      id: 'm-3',
      month: 'SEP',
      day: '10',
      title: 'Python Final Assessment',
      category: 'Major Assessment',
    },
    {
      id: 'm-4',
      month: 'SEP',
      day: '12',
      title: 'Project Allocation Review',
      category: 'Deployment Review',
    },
  ];

  return (
    <div className="exec-ops-card upcoming-milestones-card">
      <div className="ops-card-header">
        <div className="ops-card-title-group">
          <Calendar size={16} className="ops-card-icon indigo" />
          <h3 className="ops-card-title">Upcoming Milestones</h3>
        </div>
        <button
          type="button"
          className="ops-card-link-btn"
          onClick={() => onNavigate?.('sessions')}
        >
          View Calendar <ArrowRight size={14} />
        </button>
      </div>

      <div className="ops-card-body flex-1 flex flex-col justify-between">
        <div className="milestones-list">
          {milestones.map((m) => (
            <div
              key={m.id}
              className="milestone-item-row"
              onClick={() => onNavigate?.('sessions')}
              role="button"
              tabIndex={0}
            >
              <div className="milestone-date-badge">
                <span className="milestone-month">{m.month}</span>
                <span className="milestone-day">{m.day}</span>
              </div>

              <div className="milestone-info-col">
                <span className="milestone-title">{m.title}</span>
                <span className="milestone-cat-sub">{m.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpcomingMilestonesCard;
