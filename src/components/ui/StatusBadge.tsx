import React from 'react';
import clsx from 'clsx';

export type StatusVariant =
  | 'active'
  | 'planned'
  | 'completed'
  | 'archived'
  | 'on-track'
  | 'needs-attention'
  | 'at-risk'
  | 'project-ready'
  | 'default';

export interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  icon,
  size = 'md',
  className,
}) => {
  const cleanStatus = (status || '').toLowerCase().trim();
  const resolvedVariant =
    variant ||
    (cleanStatus === 'active' || cleanStatus === 'on track' || cleanStatus === 'project ready'
      ? 'active'
      : cleanStatus === 'planned' || cleanStatus === 'draft' || cleanStatus === 'scheduled'
      ? 'planned'
      : cleanStatus === 'completed'
      ? 'completed'
      : cleanStatus === 'needs attention'
      ? 'needs-attention'
      : cleanStatus === 'at risk' || cleanStatus === 'failed' || cleanStatus === 'cancelled'
      ? 'at-risk'
      : cleanStatus === 'archived' || cleanStatus === 'inactive'
      ? 'archived'
      : 'default');

  return (
    <span className={clsx('ui-status-badge', `status-${resolvedVariant}`, `size-${size}`, className)}>
      {icon ? (
        <span className="ui-badge-icon">{icon}</span>
      ) : (
        <span className={clsx('badge-status-dot', `dot-${resolvedVariant}`)} />
      )}
      <span>{status.toUpperCase()}</span>
    </span>
  );
};
