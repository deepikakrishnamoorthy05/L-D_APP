import React from 'react';
import clsx from 'clsx';

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  error,
  helpText,
  className,
  fullWidth = false,
  children,
}) => {
  return (
    <div className={clsx('ui-form-field', { 'full-width': fullWidth }, className)}>
      {label && (
        <label className="ui-label">
          {label} {required && <span className="ui-required-star">*</span>}
        </label>
      )}
      <div className="ui-field-control">{children}</div>
      {error ? (
        <span className="ui-field-error">{error}</span>
      ) : helpText ? (
        <span className="ui-field-help">{helpText}</span>
      ) : null}
    </div>
  );
};

export interface FormGridProps {
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

export const FormGrid: React.FC<FormGridProps> = ({
  columns = 2,
  gap = 'md',
  className,
  children,
}) => {
  return (
    <div className={clsx('ui-form-grid', `cols-${columns}`, `gap-${gap}`, className)}>
      {children}
    </div>
  );
};
