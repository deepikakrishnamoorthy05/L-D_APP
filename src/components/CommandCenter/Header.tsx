import React, { useState } from 'react';
import { Bell, ShieldCheck, ChevronRight } from 'lucide-react';
import { NotificationDropdown } from '../Common/NotificationDropdown';

interface HeaderProps {
  onNavigate?: (navId: string, filter?: any) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = 4;

  return (
    <header className="app-top-header">
      {/* Left: Breadcrumbs & Page Heading */}
      <div className="header-left">
        <nav className="header-breadcrumbs" aria-label="Breadcrumb">
          <span className="breadcrumb-item">L&amp;D</span>
          <ChevronRight size={12} className="breadcrumb-separator" />
          <span className="breadcrumb-item active">Command Center</span>
        </nav>

        <div className="header-title-block">
          <h1 className="header-page-title">Command Center</h1>
          <p className="header-page-subtitle">
            L&amp;D operations, priorities and important actions at a glance.
          </p>
        </div>
      </div>

      {/* Right: Academic Year, Notifications & User Profile */}
      <div className="header-right">
        {/* Academic / Training Year Badge */}
        <div className="academic-year-pill" title="Current Academic & Training Year">
          <span className="year-label">Academic / Training Year:</span>
          <strong className="year-value">2026</strong>
        </div>

        {/* Notification Bell Icon */}
        <div className="notification-wrapper">
          <button
            type="button"
            className="icon-action-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {/* Notification Drawer Dropdown */}
          {showNotifications && (
            <NotificationDropdown
              onClose={() => setShowNotifications(false)}
              onNavigate={onNavigate}
            />
          )}
        </div>

        {/* User Role Profile Badge */}
        <div className="header-user-profile">
          <div className="user-avatar-circle">
            <ShieldCheck size={18} className="avatar-shield-icon" />
          </div>
          <div className="user-info-text">
            <span className="user-role-badge">L&amp;D Team</span>
            <span className="user-tenant-tag">Systech Enterprise</span>
          </div>
        </div>
      </div>
    </header>
  );
};
