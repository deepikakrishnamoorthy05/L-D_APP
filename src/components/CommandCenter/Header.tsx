import React, { useState } from 'react';
import { Bell, ShieldCheck, ChevronRight, X } from 'lucide-react';
import { RECENT_ACTIVITIES } from '../../data/mockData';

interface HeaderProps {}

export const Header: React.FC<HeaderProps> = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = 3;

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
          <h1 className="header-page-title">L&amp;D Command Center</h1>
          <p className="header-page-subtitle">
            Monitor learning progress, identify skill gaps and support trainee development.
          </p>
        </div>
      </div>

      {/* Right: AI Pulse, Notifications & User Role Profile */}
      <div className="header-right">
        {/* AI Status Indicator Badge */}
        <div className="header-ai-status" title="Systech AI Intelligence Pipeline Status">
          <span className="cyan-pulse-dot" />
          <span className="ai-status-label">Learning Intelligence Online</span>
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
            <div className="notification-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-title">
                  <Bell size={14} />
                  <span>System Notifications</span>
                </div>
                <button
                  type="button"
                  className="close-dropdown-btn"
                  onClick={() => setShowNotifications(false)}
                >
                  <X size={14} />
                </button>
              </div>

              <div className="dropdown-list">
                {RECENT_ACTIVITIES.map((act) => (
                  <div key={act.id} className="dropdown-item">
                    <div className="item-icon-dot" />
                    <div className="item-content">
                      <span className="item-title">{act.title}</span>
                      <p className="item-desc">{act.description}</p>
                      <span className="item-time">{act.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
