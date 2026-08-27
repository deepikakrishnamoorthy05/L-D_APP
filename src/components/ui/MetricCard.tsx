import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  variant?: 'cyan' | 'indigo' | 'green' | 'amber' | 'rose' | 'default';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  icon,
  trend,
  variant = 'default',
  className,
}) => {
  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      className={clsx('ui-metric-card', `ui-metric-${variant}`, className)}
    >
      <div className="ui-metric-top">
        <span className="ui-metric-label">{label}</span>
        {icon && <span className="ui-metric-icon">{icon}</span>}
      </div>

      <div className="ui-metric-value-row">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="ui-metric-value"
        >
          {value}
        </motion.div>
        {trend && (
          <span className={clsx('ui-metric-trend', `trend-${trend.direction}`)}>
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '•'} {trend.value}
          </span>
        )}
      </div>

      {subtext && <span className="ui-metric-subtext">{subtext}</span>}
    </motion.div>
  );
};
