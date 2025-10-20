import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuItem } from '@/shared/ui-toolkit';
import { Button } from '@/shared/ui-toolkit';
import { columnsDef, PRESETS, PresetName } from '../constants';

interface ColumnSettingsProps {
  children: React.ReactNode;
  visibleColumns: Record<string, boolean>;
  onVisibleColumnsChange: (columns: Record<string, boolean>) => void;
}

export function ColumnSettings({ 
  children,
  visibleColumns, 
  onVisibleColumnsChange 
}: ColumnSettingsProps) {
  const handleColumnToggle = (key: string) => {
    onVisibleColumnsChange({
      ...visibleColumns,
      [key]: !visibleColumns[key]
    });
  };

  const handlePresetSelect = (presetName: PresetName) => {
    onVisibleColumnsChange(PRESETS[presetName]);
  };

  const handleSelectAll = () => {
    const allTrue = columnsDef.reduce((acc, col) => ({ ...acc, [col.key]: true }), {});
    onVisibleColumnsChange(allTrue);
  };

  const handleSelectNone = () => {
    const allFalse = columnsDef.reduce((acc, col) => ({ ...acc, [col.key]: false }), {});
    onVisibleColumnsChange(allFalse);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 p-0" align="end">
        <div className="flex">
          <div className="w-1/2 border-r border-border">
            <div className="p-3 border-b border-border">
              <h4 className="text-sm font-medium">Шаблоны</h4>
            </div>
            <div className="p-2 space-y-1">
              <button
                onClick={() => handlePresetSelect('all')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
              >
                Все
              </button>
              <button
                onClick={() => handlePresetSelect('minimum')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
              >
                Минимум
              </button>
              <button
                onClick={() => handlePresetSelect('geo')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
              >
                Гео
              </button>
              <button
                onClick={() => handlePresetSelect('info')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
              >
                Инфо
              </button>
              <button
                onClick={() => handlePresetSelect('stats')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
              >
                Статы
              </button>
            </div>
            
            <div className="p-2 border-t border-border">
              <button
                onClick={handleSelectAll}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
              >
                Выбрать все
              </button>
              <button
                onClick={handleSelectNone}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
              >
                Снять все
              </button>
            </div>
          </div>
          
          <div className="w-1/2">
            <div className="p-3 border-b border-border">
              <h4 className="text-sm font-medium">Колонки</h4>
            </div>
            <div className="max-h-64 overflow-y-auto p-2">
              {columnsDef.map((column) => (
                <label
                  key={column.key}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={visibleColumns[column.key] || false}
                    onChange={() => handleColumnToggle(column.key)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <span className="text-sm">{column.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
