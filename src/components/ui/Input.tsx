import React, { forwardRef } from 'react';
import clsx from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, iconLeft, iconRight, disabled, ...props }, ref) => {
    return (
      <div className="ui-input-wrapper">
        {iconLeft && <span className="ui-input-icon-left">{iconLeft}</span>}
        <input
          ref={ref}
          disabled={disabled}
          className={clsx(
            'ui-input',
            { 'has-icon-left': !!iconLeft, 'has-icon-right': !!iconRight, 'ui-input-error': !!error },
            className
          )}
          {...props}
        />
        {iconRight && <span className="ui-input-icon-right">{iconRight}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
