import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';

export interface GlassCardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'hero' | 'accent' | 'flat' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  enable3d?: boolean;
  children: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  variant = 'default',
  padding = 'md',
  enable3d = false,
  className,
  children,
  ...props
}) => {
  return (
    <motion.div
      whileHover={
        variant === 'interactive' || enable3d
          ? { y: -4, scale: 1.008, transition: { duration: 0.2 } }
          : undefined
      }
      className={clsx(
        'ui-glass-card',
        `ui-card-${variant}`,
        `ui-padding-${padding}`,
        { 'ui-card-3d': enable3d },
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
