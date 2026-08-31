import React from 'react';
import { Calendar, ArrowRight, Clock } from 'lucide-react';
import { UPCOMING_ACTIVITIES } from '../../data/mockData';

interface UpcomingTrainingCardProps {
  onNavigate?: (navId: string) => void;
}

export const UpcomingTrainingCard: React.FC<UpcomingTrainingCardProps> = ({ onNavigate }) => {
  // Show maximum 3 upcoming items
  const upcomingItems = UPCOMING_ACTIVITIES.slice(0, 3);

  // Formatted day pills for clean presentation
  const getDayBadge = (idx: number, dateTimeStr: string) => {
    if (dateTimeStr.toLowerCase().includes('today')) return 'Today';
    if (dateTimeStr.toLowerCase().includes('tomorrow')) return 'Tomorrow';
    if (dateTimeStr.toLowerCase().includes('friday')) return 'Friday';
    if (idx === 0) return 'Today';
    if (idx === 1) return 'Tomorrow';
    return 'Friday';
  };

  return (
    <div className="exec-ops-card">
      <div className="ops-card-header">
        <div className="ops-card-title-group">
          <Calendar size={16} className="ops-card-icon indigo" />
          <h3 className="ops-card-title">Upcoming Training</h3>
        </div>
        <button
          type="button"
          className="ops-card-link-btn"
          onClick={() => onNavigate?.('sessions')}
        >
          View Calendar <ArrowRight size={14} />
        </button>
      </div>

      <div className="ops-card-body">
        <div className="upcoming-training-list">
          {upcomingItems.map((item, idx) => {
            const dayTag = getDayBadge(idx, item.dateTime);
            return (
              <div
                key={item.id}
                className="upcoming-session-item"
                onClick={() => onNavigate?.('sessions')}
                role="button"
                tabIndex={0}
              >
                <div className="session-day-tag">{dayTag}</div>

                <div className="session-details-col">
                  <div className="session-title-text">{item.sessionTitle}</div>
                  <div className="session-time-text">
                    <Clock size={12} className="inline-clock-icon" />
                    <span>{item.dateTime.replace(/^(Today|Tomorrow|Friday) •\s*/i, '')}</span>
                  </div>
                </div>

                {item.type && (
                  <span className={`session-type-pill ${item.type.toLowerCase()}`}>
                    {item.type}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UpcomingTrainingCard;
