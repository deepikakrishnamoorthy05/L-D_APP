import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  className,
  children,
  disabled,
  ...props
}) => {
  return (
    <motion.button
      whileHover={{ y: disabled || isLoading ? 0 : -2, scale: disabled || isLoading ? 1 : 1.01 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      transition={{ duration: 0.15 }}
      className={clsx(
        'ui-button',
        `ui-btn-${variant}`,
        `ui-btn-${size}`,
        { 'ui-btn-loading': isLoading },
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="ui-spinner" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="ui-btn-icon-left">{icon}</span>}
          {children && <span>{children}</span>}
          {icon && iconPosition === 'right' && <span className="ui-btn-icon-right">{icon}</span>}
        </>
      )}
    </motion.button>
  );
};

export const IconButton: React.FC<ButtonProps> = ({ className, ...props }) => {
  return <Button className={clsx('ui-icon-button', className)} {...props} />;
};
