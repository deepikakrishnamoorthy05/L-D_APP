import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export interface SegmentOption {
  id: string;
  label: string;
  badge?: string | number;
}

export interface SegmentedControlProps {
  options: SegmentOption[];
  value: string;
  onChange: (val: string) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  size = 'md',
  className,
}) => {
  return (
    <div className={clsx('ui-segmented-control', `size-${size}`, className)}>
      {options.map((opt) => {
        const isActive = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            className={clsx('ui-segment-item', { active: isActive })}
            onClick={() => onChange(opt.id)}
          >
            {isActive && (
              <motion.div
                layoutId="segmentedPillActive"
                className="ui-segment-pill-bg"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="ui-segment-text">{opt.label}</span>
            {opt.badge !== undefined && (
              <span className="ui-segment-badge">{opt.badge}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
