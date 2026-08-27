import React from 'react';
import { Search, X } from 'lucide-react';
import { Input, InputProps } from './Input';
import clsx from 'clsx';

export interface SearchInputProps extends Omit<InputProps, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  className,
  ...props
}) => {
  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      iconLeft={<Search size={16} className="ui-search-icon" />}
      iconRight={
        value ? (
          <button
            type="button"
            className="ui-search-clear-btn"
            onClick={() => {
              onChange('');
              if (onClear) onClear();
            }}
          >
            <X size={14} />
          </button>
        ) : undefined
      }
      className={clsx('ui-search-input', className)}
      {...props}
    />
  );
};
