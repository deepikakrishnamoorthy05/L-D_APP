import React from 'react';
import { Activity, Award, MessageSquare, ShieldCheck, Calendar, CheckSquare } from 'lucide-react';
import { RECENT_ACTIVITIES } from '../../data/mockData';

interface ExecutiveRecentActivityProps {
  onNavigate?: (navId: string) => void;
}

export const ExecutiveRecentActivity: React.FC<ExecutiveRecentActivityProps> = ({ onNavigate }) => {
  const activities = [
    {
      id: 'ra-1',
      description: 'Saran Mani marked Project Ready',
      timestamp: '10 min ago',
      icon: <Award size={14} className="act-icon green" />,
      navTarget: 'trainees',
    },
    {
      id: 'ra-2',
      description: 'Trainer feedback imported for SQL Cohort',
      timestamp: '25 min ago',
      icon: <MessageSquare size={14} className="act-icon cyan" />,
      navTarget: 'feedback',
    },
    {
      id: 'ra-3',
      description: 'DP-700 readiness updated',
      timestamp: '1 hour ago',
      icon: <ShieldCheck size={14} className="act-icon indigo" />,
      navTarget: 'certifications',
    },
    {
      id: 'ra-4',
      description: 'New session scheduled: Python Data Pipeline',
      timestamp: '2 hours ago',
      icon: <Calendar size={14} className="act-icon teal" />,
      navTarget: 'sessions',
    },
    {
      id: 'ra-5',
      description: 'SQL Advanced Indexing assessment results published',
      timestamp: '3 hours ago',
      icon: <CheckSquare size={14} className="act-icon amber" />,
      navTarget: 'assessments',
    },
  ];

  return (
    <div className="exec-ops-card recent-activity-card">
      <div className="ops-card-header">
        <div className="ops-card-title-group">
          <Activity size={16} className="ops-card-icon teal" />
          <h3 className="ops-card-title">Recent Activity</h3>
        </div>
      </div>

      <div className="ops-card-body">
        <div className="activity-timeline-list">
          {activities.map((item) => (
            <div
              key={item.id}
              className="timeline-item-row"
              onClick={() => onNavigate?.(item.navTarget)}
              role="button"
              tabIndex={0}
            >
              <div className="timeline-icon-box">{item.icon}</div>
              <div className="timeline-content">
                <span className="timeline-desc">{item.description}</span>
                <span className="timeline-time">{item.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveRecentActivity;
