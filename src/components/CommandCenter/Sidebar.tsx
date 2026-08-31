import React, { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Calendar,
  CheckSquare,
  MessageSquare,
  Brain,
  Award,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  X
} from 'lucide-react';
import systechLogo from '../../assets/systech-logo.png';

interface SidebarProps {
  currentNav: string;
  onSelectNav: (navId: string) => void;
  onLogout?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  isFunctional: boolean;
}

interface NavGroup {
  groupLabel: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentNav,
  onSelectNav,
  onLogout,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeToast, setActiveToast] = useState<string | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);

  const NAV_GROUPS: NavGroup[] = [
    {
      groupLabel: 'NAVIGATION',
      items: [
        { id: 'command-center', label: 'Command Center', icon: <LayoutDashboard size={18} />, isFunctional: true }
      ]
    },
    {
      groupLabel: 'LEARNING',
      items: [
        { id: 'bootcamps', label: 'Bootcamps', icon: <BookOpen size={18} />, isFunctional: true },
        { id: 'trainees', label: 'Trainees', icon: <Users size={18} />, isFunctional: true },
        { id: 'sessions', label: 'Sessions', icon: <Calendar size={18} />, isFunctional: true }
      ]
    },
    {
      groupLabel: 'PERFORMANCE',
      items: [
        { id: 'assessments', label: 'Assessments', icon: <CheckSquare size={18} />, isFunctional: true },
        { id: 'feedback', label: 'Feedback', icon: <MessageSquare size={18} />, isFunctional: true },
        { id: 'skill-intelligence', label: 'Skill Intelligence', icon: <Brain size={18} />, isFunctional: true }
      ]
    },
    {
      groupLabel: 'DEVELOPMENT',
      items: [
        { id: 'certifications', label: 'Certifications', icon: <Award size={18} />, isFunctional: true },
        { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} />, isFunctional: true }
      ]
    }
  ];

  const handleNavClick = (item: NavItem) => {
    if (item.isFunctional) {
      onSelectNav(item.id);
      if (onCloseMobile) {
        onCloseMobile();
      }
    } else {
      setActiveToast(`${item.label} module planned for upcoming release.`);
      setTimeout(() => setActiveToast(null), 3000);
    }
  };

  const handleLogoutClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <>
      {/* Overlay Backdrop for Mobile Drawer */}
      {mobileOpen && (
        <div
          className="sidebar-mobile-overlay"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`app-sidebar ${collapsed ? 'collapsed' : ''} ${
          mobileOpen ? 'mobile-drawer-open' : ''
        }`}
      >
        {/* Toast Notification for Non-Functional Nav Items */}
        {activeToast && (
          <div className="nav-toast-popup" role="status">
            <Sparkles size={14} className="toast-sparkle" />
            <span>{activeToast}</span>
          </div>
        )}

        {/* Sidebar Header & Brand Logo */}
        <div className="sidebar-header">
          <div className="brand-wrapper">
            {!logoFailed ? (
              <img
                src={systechLogo}
                alt="Systech Solutions"
                className="sidebar-brand-logo"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#005bb5' }}>SYSTECH</span>
            )}
            {(!collapsed || mobileOpen) && (
              <div className="brand-text-block">
                <span className="brand-app-badge">L&amp;D PLATFORM</span>
              </div>
            )}
          </div>

          {/* Close button for Mobile Drawer / Collapse Toggle for Desktop */}
          <div className="sidebar-header-actions">
            {mobileOpen ? (
              <button
                type="button"
                className="mobile-drawer-close-btn"
                onClick={onCloseMobile}
                aria-label="Close navigation menu"
              >
                <X size={20} />
              </button>
            ) : (
              <button
                type="button"
                className="sidebar-toggle-btn"
                onClick={() => setCollapsed(!collapsed)}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            )}
          </div>
        </div>

        {/* Grouped Navigation */}
        <nav className="sidebar-nav">
          {NAV_GROUPS.map((group) => (
            <div key={group.groupLabel} className="nav-group-block">
              {(!collapsed || mobileOpen) && (
                <div className="nav-section-label">{group.groupLabel}</div>
              )}
              <ul className="nav-list">
                {group.items.map((item) => {
                  const isActive = currentNav === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={`nav-item-btn ${isActive ? 'active' : ''} ${
                          !item.isFunctional ? 'disabled-look' : ''
                        }`}
                        onClick={() => handleNavClick(item)}
                        title={collapsed && !mobileOpen ? item.label : undefined}
                      >
                        <span className="nav-item-icon">{item.icon}</span>
                        {(!collapsed || mobileOpen) && (
                          <span className="nav-item-label">{item.label}</span>
                        )}
                        {isActive && <span className="active-indicator-bar" />}
                        {!item.isFunctional && (!collapsed || mobileOpen) && (
                          <span className="upcoming-tag">Soon</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer & Sign Out Action */}
        <div className="sidebar-footer">
          {onLogout && (
            <button
              type="button"
              className="logout-nav-btn"
              onClick={handleLogoutClick}
              title={collapsed && !mobileOpen ? 'Sign Out / Demo Reset' : undefined}
            >
              <LogOut size={18} />
              {(!collapsed || mobileOpen) && <span>Sign Out</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
