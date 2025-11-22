import React from 'react';
import { Button } from '@/shared/ui-toolkit';

interface PaginationProps {
  pageIndex: number;
  totalPages: number;
  totalElements: number;
  size: number;
  pageInput: string;
  onPageInputChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onPageInputCommit: () => void;
}

export function Pagination({
  pageIndex,
  totalPages,
  totalElements,
  size,
  pageInput,
  onPageInputChange,
  onPageChange,
  onPageInputCommit
}: PaginationProps) {
  const startItem = pageIndex * size + 1;
  const endItem = Math.min((pageIndex + 1) * size, totalElements);

  return (
    <div className="table-wave-enter flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
      <Button 
        variant="outline" 
        size="sm" 
        className="table-button-enter-delay-1 h-8 px-3" 
        onClick={() => onPageChange(0)}
        disabled={pageIndex <= 0}
      >
        « Первая
      </Button>

      <Button 
        variant="outline" 
        size="sm" 
        className="table-button-enter-delay-2 h-8 px-3"
        onClick={() => onPageChange(Math.max(0, pageIndex - 1))} 
        disabled={pageIndex <= 0}
      >
        ‹ Предыдущая
      </Button>

      <div className="table-wave-enter-delay-3 flex items-center gap-2">
        <span>Стр.</span>
        <input
          value={pageInput}
          onChange={e => onPageInputChange(e.target.value)}
          onBlur={onPageInputCommit}
          onKeyDown={e => {
            if (e.key === 'Enter') onPageInputCommit();
          }}
          className="table-button-enter-delay-3 h-8 w-16 rounded-md border border-input bg-background px-2 text-center"
          inputMode="numeric"
          aria-label="Номер страницы"
        />
        <span>из {totalPages || 1}</span>
      </div>

      <span className="table-wave-enter-delay-4 mx-2 hidden md:inline">
        • Показано {startItem}–{endItem} из {totalElements}
      </span>

      <Button 
        variant="outline" 
        size="sm" 
        className="table-button-enter-delay-4 h-8 px-3"
        onClick={() => onPageChange(Math.min((totalPages || 1) - 1, pageIndex + 1))}
        disabled={totalPages === 0 || pageIndex >= (totalPages - 1)}
      >
        Следующая ›
      </Button>

      <Button 
        variant="outline" 
        size="sm" 
        className="table-button-enter-delay-5 h-8 px-3"
        onClick={() => onPageChange(Math.max(0, (totalPages || 1) - 1))}
        disabled={totalPages === 0 || pageIndex >= (totalPages - 1)}
      >
        Последняя »
      </Button>
    </div>
  );
}
