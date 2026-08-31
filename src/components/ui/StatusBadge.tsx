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

  let resolvedVariant: StatusVariant = variant || 'default';

  if (!variant) {
    if (cleanStatus === 'on track' || cleanStatus === 'ontrack') {
      resolvedVariant = 'on-track';
    } else if (cleanStatus === 'project ready' || cleanStatus === 'projectready') {
      resolvedVariant = 'project-ready';
    } else if (
      cleanStatus === 'needs attention' ||
      cleanStatus === 'need attention' ||
      cleanStatus === 'attention'
    ) {
      resolvedVariant = 'needs-attention';
    } else if (
      cleanStatus === 'at risk' ||
      cleanStatus === 'atrisk' ||
      cleanStatus === 'failed' ||
      cleanStatus === 'cancelled'
    ) {
      resolvedVariant = 'at-risk';
    } else if (cleanStatus === 'active') {
      resolvedVariant = 'active';
    } else if (cleanStatus === 'planned' || cleanStatus === 'draft' || cleanStatus === 'scheduled') {
      resolvedVariant = 'planned';
    } else if (cleanStatus === 'completed' || cleanStatus === 'published') {
      resolvedVariant = 'completed';
    } else if (cleanStatus === 'archived' || cleanStatus === 'inactive') {
      resolvedVariant = 'archived';
    }
  }

  return (
    <span
      className={clsx(
        'ui-status-badge',
        `status-${resolvedVariant}`,
        `size-${size}`,
        className
      )}
    >
      {icon ? (
        <span className="ui-badge-icon">{icon}</span>
      ) : (
        <span className={clsx('badge-status-dot', `dot-${resolvedVariant}`)} />
      )}
      <span>{status ? status.toUpperCase() : 'UNKNOWN'}</span>
    </span>
  );
};
