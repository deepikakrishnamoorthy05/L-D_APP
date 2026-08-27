import React from 'react';
import { RECENT_ACTIVITIES } from '../../data/mockData';
import { Activity, Clock } from 'lucide-react';

export const RecentActivityFeed: React.FC = () => {
  return (
    <div className="side-widget-card">
      <div className="widget-header">
        <div className="title-with-icon">
          <Activity size={16} className="widget-icon" />
          <h3 className="widget-title">Recent L&amp;D Activity</h3>
        </div>
      </div>

      <div className="activity-feed-timeline">
        {RECENT_ACTIVITIES.map((item) => (
          <div key={item.id} className="feed-item">
            <div className="feed-node-dot" />
            <div className="feed-content">
              <div className="feed-top-row">
                <span className="feed-title">{item.title}</span>
                <span className="feed-time">
                  <Clock size={11} /> {item.timestamp}
                </span>
              </div>
              <p className="feed-desc">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
