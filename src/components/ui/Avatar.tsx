import React from 'react';
import clsx from 'clsx';

export interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circle' | 'square';
  colorScheme?: 'teal' | 'indigo' | 'amber' | 'cyan' | 'purple';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 'md',
  variant = 'circle',
  colorScheme = 'teal',
  className,
}) => {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <div className={clsx('ui-avatar', `size-${size}`, `variant-${variant}`, `color-${colorScheme}`, className)}>
      <span>{initials}</span>
    </div>
  );
};
