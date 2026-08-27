import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export interface ProgressBarProps {
  value: number; // 0 - 100
  color?: 'cyan' | 'indigo' | 'amber' | 'rose' | 'green';
  height?: number;
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = 'cyan',
  height = 8,
  showLabel = false,
  className,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={clsx('ui-progress-bar-wrapper', className)}>
      {showLabel && (
        <div className="ui-progress-label-row">
          <span>Completion</span>
          <span className="ui-progress-value-text">{clampedValue}%</span>
        </div>
      )}
      <div className="ui-progress-track" style={{ height }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={clsx('ui-progress-fill', `fill-${color}`)}
        />
      </div>
    </div>
  );
};
