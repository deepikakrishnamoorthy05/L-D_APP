import React, { useState } from 'react';
import {
  LayoutDashboard,
  Layers,
  GraduationCap,
  Calendar,
  ClipboardCheck,
  MessageSquare,
  Brain,
  Award,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Settings,
  X,
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
      groupLabel: 'OVERVIEW',
      items: [
        {
          id: 'command-center',
          label: 'Command Center',
          icon: <LayoutDashboard size={18} />,
          isFunctional: true,
        },
      ],
    },
    {
      groupLabel: 'LEARNING',
      items: [
        {
          id: 'bootcamps',
          label: 'Bootcamps',
          icon: <Layers size={18} />,
          isFunctional: true,
        },
        {
          id: 'training',
          label: 'Training',
          icon: <GraduationCap size={18} />,
          isFunctional: true,
        },
        {
          id: 'calendar',
          label: 'L&D Calendar',
          icon: <Calendar size={18} />,
          isFunctional: true,
        },
        {
          id: 'certifications',
          label: 'Certifications',
          icon: <Award size={18} />,
          isFunctional: true,
        },
        {
          id: 'assessments',
          label: 'Assessments',
          icon: <ClipboardCheck size={18} />,
          isFunctional: true,
        },
        {
          id: 'feedback',
          label: 'Feedback',
          icon: <MessageSquare size={18} />,
          isFunctional: true,
        },
      ],
    },
    {
      groupLabel: 'INTELLIGENCE',
      items: [
        {
          id: 'skill-intelligence',
          label: 'Skill Intelligence',
          icon: <Brain size={18} />,
          isFunctional: true,
        },
        {
          id: 'analytics',
          label: 'Analytics',
          icon: <BarChart3 size={18} />,
          isFunctional: true,
        },
      ],
    },
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

  const isCollapsedMode = collapsed && !mobileOpen;

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-mobile-overlay"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`app-sidebar ${isCollapsedMode ? 'collapsed' : ''} ${
          mobileOpen ? 'mobile-drawer-open' : ''
        }`}
      >
        {/* Toast Notification Banner */}
        {activeToast && (
          <div className="nav-toast-popup" role="status">
            <span>{activeToast}</span>
          </div>
        )}

        {/* 1. TOP BRAND AREA */}
        <div className="sidebar-header">
          <div className="brand-wrapper" title={isCollapsedMode ? 'Systech Solutions — L&D Platform' : undefined}>
            {!logoFailed ? (
              <img
                src={systechLogo}
                alt="Systech Solutions"
                className="sidebar-brand-logo-img"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <span className="brand-title-main">Systech</span>
            )}
            {!isCollapsedMode && (
              <div className="brand-text-block">
                <span className="brand-subtitle-sub">L&amp;D Platform</span>
              </div>
            )}
            {isCollapsedMode && (
              <span className="sidebar-tooltip">Systech Solutions</span>
            )}
          </div>

          <div className="sidebar-header-actions">
            {mobileOpen ? (
              <button
                type="button"
                className="sidebar-icon-btn mobile-close-btn"
                onClick={onCloseMobile}
                aria-label="Close menu"
                title="Close menu"
              >
                <X size={18} />
              </button>
            ) : (
              <button
                type="button"
                className="sidebar-icon-btn collapse-toggle-btn"
                onClick={() => setCollapsed(!collapsed)}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
              </button>
            )}
          </div>
        </div>

        {/* 2. NAVIGATION AREA */}
        <nav className="sidebar-nav">
          {NAV_GROUPS.map((group) => (
            <div key={group.groupLabel} className="nav-group-block">
              {!isCollapsedMode && (
                <div className="nav-section-label">{group.groupLabel}</div>
              )}
              <ul className="nav-list">
                {group.items.map((item) => {
                  const isActive = currentNav === item.id;
                  return (
                    <li key={item.id} className="nav-list-item">
                      <button
                        type="button"
                        className={`nav-item-btn ${isActive ? 'active' : ''} ${
                          !item.isFunctional ? 'disabled-look' : ''
                        }`}
                        onClick={() => handleNavClick(item)}
                      >
                        {isActive && <span className="active-accent-bar" />}
                        <span className="nav-item-icon">{item.icon}</span>
                        {!isCollapsedMode && (
                          <span className="nav-item-label">{item.label}</span>
                        )}
                        {!item.isFunctional && !isCollapsedMode && (
                          <span className="upcoming-tag">Soon</span>
                        )}

                        {/* Minimal Tooltip on Collapsed Hover */}
                        {isCollapsedMode && (
                          <span className="sidebar-tooltip">{item.label}</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* 3. BOTTOM PROFILE AREA */}
        <div className="sidebar-footer">
          <div className="profile-card-block">
            <div className="avatar-circle-badge">
              <span>LA</span>
            </div>

            {!isCollapsedMode ? (
              <div className="profile-info-block">
                <span className="profile-name-text">L&amp;D Admin</span>
                <span className="profile-role-text">Administrator</span>
              </div>
            ) : (
              <span className="sidebar-tooltip">L&amp;D Admin (Administrator)</span>
            )}
          </div>

          <div className="footer-actions-row">
            <button
              type="button"
              className="profile-action-btn"
              onClick={() => {
                setActiveToast('Settings & preferences panel coming soon.');
                setTimeout(() => setActiveToast(null), 3000);
              }}
              title={isCollapsedMode ? 'Settings' : undefined}
            >
              <Settings size={16} />
              {!isCollapsedMode && <span>Settings</span>}
              {isCollapsedMode && <span className="sidebar-tooltip">Settings</span>}
            </button>

            {onLogout && (
              <button
                type="button"
                className="profile-action-btn logout-btn"
                onClick={handleLogoutClick}
                title={isCollapsedMode ? 'Sign Out' : undefined}
              >
                <LogOut size={16} />
                {!isCollapsedMode && <span>Sign Out</span>}
                {isCollapsedMode && <span className="sidebar-tooltip">Sign Out</span>}
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
