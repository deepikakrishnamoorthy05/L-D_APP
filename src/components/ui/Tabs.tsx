import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export interface TabItem {
  id: string;
  label: string;
  badge?: number | string;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pills' | 'segmented';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className,
}) => {
  return (
    <div className={clsx('ui-tabs-wrapper', `tabs-${variant}`, className)}>
      <div className="ui-tabs-list" role="tablist">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              className={clsx('ui-tab-button', { active: isActive })}
              onClick={() => onChange(tab.id)}
            >
              <span className="ui-tab-label">{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={clsx('ui-tab-badge', { active: isActive })}>
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="ui-tab-active-indicator"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
