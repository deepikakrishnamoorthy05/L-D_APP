import React from 'react';
import { UPCOMING_ACTIVITIES } from '../../data/mockData';
import { Calendar, Clock, User } from 'lucide-react';

export const UpcomingActivity: React.FC = () => {
  return (
    <div className="side-widget-card">
      <div className="widget-header">
        <div className="title-with-icon">
          <Calendar size={16} className="widget-icon" />
          <h3 className="widget-title">Upcoming Learning Activity</h3>
        </div>
      </div>

      <div className="activity-list">
        {UPCOMING_ACTIVITIES.map((item) => (
          <div key={item.id} className="activity-item-card">
            <div className="activity-main">
              <span className="activity-title">{item.sessionTitle}</span>
              <div className="activity-meta">
                <span className="meta-info">
                  <User size={12} /> {item.trainer}
                </span>
                <span className="meta-info">
                  <Clock size={12} /> {item.dateTime}
                </span>
              </div>
            </div>
            <div className="activity-batch-badge">{item.batch}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
