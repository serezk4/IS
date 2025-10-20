import React from 'react';
import { Input, Label } from '@/shared/ui-toolkit';

interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number | string;
  defaultValue?: string | number;
  description?: string;
  className?: string;
  onInput?: (e: React.FormEvent<HTMLInputElement>) => void;
  onInvalid?: (e: React.FormEvent<HTMLInputElement>) => void;
}

export function FormField({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  maxLength,
  min,
  max,
  step,
  defaultValue,
  description,
  className = '',
  onInput,
  onInvalid,
}: FormFieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <Label htmlFor={id}>{label} {required && '*'}</Label>
      <Input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        min={min}
        max={max}
        step={step}
        defaultValue={defaultValue}
        onInput={onInput}
        onInvalid={onInvalid}
      />
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
