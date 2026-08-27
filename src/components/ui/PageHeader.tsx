import React from 'react';
import clsx from 'clsx';

export interface PageHeaderProps {
  breadcrumb?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  breadcrumb,
  title,
  subtitle,
  action,
  className,
}) => {
  return (
    <header className={clsx('ui-page-header', className)}>
      <div className="ui-page-header-text">
        {breadcrumb && <div className="ui-breadcrumb">{breadcrumb}</div>}
        <h1 className="ui-page-title">{title}</h1>
        {subtitle && <p className="ui-page-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="ui-page-header-action">{action}</div>}
    </header>
  );
};

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
  badge,
  className,
}) => {
  return (
    <div className={clsx('ui-section-header', className)}>
      <div className="ui-section-header-left">
        <div className="ui-section-title-row">
          <h2 className="ui-section-title">{title}</h2>
          {badge}
        </div>
        {subtitle && <p className="ui-section-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="ui-section-header-action">{action}</div>}
    </div>
  );
};
