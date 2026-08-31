import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, AlertTriangle, MessageSquare, Award, CheckSquare, Calendar, ShieldCheck } from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  category: 'Action Required' | 'Feedback' | 'Certification' | 'Assessment' | 'Training' | 'System';
  timestamp: string;
  isRead: boolean;
  navTarget: string;
  filterParam?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    title: '2 trainees require immediate attention',
    category: 'Action Required',
    timestamp: 'Today',
    isRead: false,
    navTarget: 'trainees',
    filterParam: 'needs-attention',
  },
  {
    id: 'n-2',
    title: '3 trainer feedback submissions pending',
    category: 'Feedback',
    timestamp: 'Today',
    isRead: false,
    navTarget: 'feedback',
  },
  {
    id: 'n-3',
    title: 'DP-700 readiness review approaching',
    category: 'Certification',
    timestamp: 'Tomorrow',
    isRead: false,
    navTarget: 'certifications',
  },
  {
    id: 'n-4',
    title: 'Python Core & OOP assessment scheduled',
    category: 'Assessment',
    timestamp: 'Tomorrow',
    isRead: false,
    navTarget: 'assessments',
  },
  {
    id: 'n-5',
    title: 'Azure Databricks Lakehouse session updated',
    category: 'Training',
    timestamp: 'Recently',
    isRead: true,
    navTarget: 'sessions',
  },
];

interface NotificationDropdownProps {
  onClose: () => void;
  onNavigate?: (navId: string, filter?: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  onClose,
  onNavigate,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const handleItemClick = (item: NotificationItem) => {
    setNotifications(
      notifications.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );
    onClose();
    if (onNavigate) {
      onNavigate(item.navTarget, item.filterParam);
    }
  };

  const getCategoryIcon = (cat: NotificationItem['category']) => {
    switch (cat) {
      case 'Action Required':
        return <AlertTriangle size={14} className="text-amber-600" />;
      case 'Feedback':
        return <MessageSquare size={14} className="text-teal-600" />;
      case 'Certification':
        return <Award size={14} className="text-indigo-600" />;
      case 'Assessment':
        return <CheckSquare size={14} className="text-emerald-600" />;
      case 'Training':
        return <Calendar size={14} className="text-cyan-600" />;
      default:
        return <ShieldCheck size={14} className="text-slate-600" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 6 }}
      transition={{ duration: 0.16 }}
      className="notification-dropdown-panel"
    >
      {/* Header Bar */}
      <div className="dropdown-header-bar">
        <div className="header-title-flex">
          <Bell size={15} className="text-teal-600" />
          <span className="title-text">NOTIFICATIONS</span>
        </div>
        <div className="header-actions-flex">
          <button
            type="button"
            className="mark-read-btn"
            onClick={handleMarkAllRead}
            title="Mark all as read"
          >
            <Check size={13} /> Mark all read
          </button>
          <button
            type="button"
            className="close-dropdown-btn"
            onClick={onClose}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* List Content */}
      <div className="dropdown-notifications-list">
        {notifications.map((item) => (
          <div
            key={item.id}
            className={`notification-row-item ${!item.isRead ? 'unread' : ''}`}
            onClick={() => handleItemClick(item)}
          >
            <div className="item-icon-box">{getCategoryIcon(item.category)}</div>
            <div className="item-content-block">
              <span className="item-title">{item.title}</span>
              <div className="item-meta-row">
                <span className="cat-badge">{item.category}</span>
                <span className="bullet">•</span>
                <span className="time-text">{item.timestamp}</span>
              </div>
            </div>
            {!item.isRead && <span className="unread-dot-indicator" />}
          </div>
        ))}
      </div>
    </motion.div>
  );
};
