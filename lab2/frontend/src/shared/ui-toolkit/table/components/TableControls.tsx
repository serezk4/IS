import React from 'react';
import { Button, Separator } from '@/shared/ui-toolkit';
import { ChevronDown, ChevronUp, RefreshCw, Settings2 } from 'lucide-react';
import { SortOrder } from '../types';
import { ColumnSettings } from './ColumnSettings';

interface TableControlsProps {
  sortField: string;
  sortOrder: SortOrder;
  onSortChange: (field: string) => void;
  onSortOrderToggle: () => void;
  size: number;
  onSizeChange: (size: number) => void;
  hoverCardEnabled: boolean;
  onHoverCardToggle: (enabled: boolean) => void;
  fullWidth: boolean;
  onFullWidthToggle: (enabled: boolean) => void;
  showHidden: boolean;
  onShowHiddenToggle: (enabled: boolean) => void;
  hiddenCount: number;
  onClearHidden: () => void;
  visibleColumns: Record<string, boolean>;
  onVisibleColumnsChange: (columns: Record<string, boolean>) => void;
}

export function TableControls({
  sortField,
  sortOrder,
  onSortChange: _onSortChange,
  onSortOrderToggle,
  size,
  onSizeChange,
  hoverCardEnabled,
  onHoverCardToggle,
  fullWidth,
  onFullWidthToggle,
  showHidden,
  onShowHiddenToggle,
  hiddenCount,
  onClearHidden,
  visibleColumns,
  onVisibleColumnsChange
}: TableControlsProps) {
  return (
    <div className="table-wave-enter flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background p-2.5">
      <div className="text-sm font-medium">Управление</div>
      <Separator orientation="vertical" className="h-6" />

      <div className="table-wave-enter-delay-1 flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Сортировка:</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{sortField}</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onSortOrderToggle}
            className="table-button-enter-delay-1 h-8 px-2"
          >
            {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span className="ml-1 text-xs">{sortOrder.toUpperCase()}</span>
          </Button>
        </div>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="table-wave-enter-delay-2 flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Размер:</span>
        <select
          value={size}
          onChange={e => onSizeChange(Number(e.target.value))}
          className="table-button-enter-delay-2 h-8 rounded-md border border-input bg-background px-2 text-sm"
        >
          {[10, 20, 50, 100].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <label className="table-wave-enter-delay-3 flex select-none items-center gap-2 text-sm">
        <input 
          type="checkbox" 
          className="h-4 w-4 accent-foreground" 
          checked={hoverCardEnabled}
          onChange={e => onHoverCardToggle(e.target.checked)}
        />
        Ховер
      </label>

      <Separator orientation="vertical" className="h-6" />

      <label className="table-wave-enter-delay-4 flex select-none items-center gap-2 text-sm">
        <input 
          type="checkbox" 
          className="h-4 w-4 accent-foreground" 
          checked={fullWidth}
          onChange={e => onFullWidthToggle(e.target.checked)}
        />
        Вся ширина
      </label>

      <div className="table-wave-enter-delay-5 ml-auto flex items-center gap-3">
        <label className="flex select-none items-center gap-2 text-sm">
          <input 
            type="checkbox" 
            className="h-4 w-4 accent-foreground" 
            checked={showHidden}
            onChange={e => onShowHiddenToggle(e.target.checked)}
          />
          Показать скрытые
        </label>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClearHidden} 
          className="table-button-enter-delay-3 h-8 px-2 gap-1"
          disabled={hiddenCount === 0}
        >
          <RefreshCw className="h-4 w-4" />
          <span className="text-xs">Очистить скрытые ({hiddenCount})</span>
        </Button>

        <ColumnSettings
          visibleColumns={visibleColumns}
          onVisibleColumnsChange={onVisibleColumnsChange}
        >
          <Button 
            variant="outline" 
            size="sm" 
            className="table-button-enter-delay-4 h-8 px-2 gap-2"
          >
            <Settings2 className="h-4 w-4" />Колонки
          </Button>
        </ColumnSettings>
      </div>
    </div>
  );
}
