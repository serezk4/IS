import React from 'react';
import { Label } from '@/shared/ui-toolkit';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  id: string;
  name: string;
  label: string;
  options: SelectOption[];
  defaultValue?: string;
  required?: boolean;
  description?: string;
  className?: string;
}

export function SelectField({
  id,
  name,
  label,
  options,
  defaultValue,
  required = false,
  description,
  className = '',
}: SelectFieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <Label htmlFor={id}>{label} {required && '*'}</Label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        required={required}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
