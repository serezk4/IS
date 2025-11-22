import React from 'react';

interface FormSectionProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function FormSection({ 
  children, 
  title, 
  className = '', 
  columns = 3 
}: FormSectionProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-4',
  };

  return (
    <section className={`space-y-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-medium">{title}</h3>
      )}
      <div className={`grid gap-4 ${gridCols[columns]}`}>
        {children}
      </div>
    </section>
  );
}
