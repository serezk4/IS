import React from 'react';
import { Label } from '@/shared/ui-toolkit';

interface CheckboxFieldProps {
  id: string;
  name: string;
  label: string;
  defaultChecked?: boolean;
  description?: string;
  className?: string;
  onChange?: (checked: boolean) => void;
}

export function CheckboxField({
  id,
  name,
  label,
  defaultChecked = false,
  description,
  className = '',
  onChange,
}: CheckboxFieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center gap-3">
        <input
          id={id}
          name={name}
          type="checkbox"
          className="h-4 w-4"
          defaultChecked={defaultChecked}
          onChange={(e) => onChange?.(e.target.checked)}
        />
        <Label htmlFor={id}>{label}</Label>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
