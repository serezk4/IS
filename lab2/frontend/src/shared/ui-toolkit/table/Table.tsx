'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useTokenRotation } from '@/app/utilities/providers/auth-provider/useTokenRotation';
import { deleteOneById } from '@/app/utilities/providers/auth-provider/api-layer';
import { useAuthContext } from '@/app/utilities';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui-toolkit';
import { ChevronDown, ChevronUp, EllipsisVertical, Eye, EyeOff, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import * as RTooltip from '@radix-ui/react-tooltip';
import EditCityModal from '@/shared/ui-toolkit/edit-book-creature';

import { columnsDef, COL_MIN } from './constants';
import { formatDateReadable } from './utils';
import { RingCell, CreatureLocationCell, CoordinatesCell } from './cells';
import { TableControls, Pagination, RowHoverCard } from './components';
import { useTableState, useTableData } from './hooks';
import { TableProps, HoverState } from './types';

const cellBase = "border-b border-border px-3 py-2 align-middle";
const headBase = "h-10 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground select-none";

function Table({ fullWidth: fullWidthProp, smartColumns: smartColumnsProp }: TableProps) {
  const { user } = useAuthContext();
  const [hover, setHover] = useState<HoverState | null>(null);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [animationsDisabled, setAnimationsDisabled] = useState(false);
  const resizingRef = useRef<{ key: string; startX: number; startW: number } | null>(null);

  const tableState = useTableState({ fullWidth: fullWidthProp, smartColumns: smartColumnsProp });
  const tableData = useTableData(
    tableState.pageIndex,
    tableState.size,
    tableState.sortField,
    tableState.sortOrder,
    null, 
    null  
  );

  const { accessToken } = useTokenRotation();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationsDisabled(true);
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  const allVisibleCols = useMemo(() => 
    columnsDef.filter(c => tableState.visibleColumns[c.key]), 
    [tableState.visibleColumns]
  );

  const dataForMeasure = useMemo(() => 
    tableState.showHidden 
      ? tableData.cities 
      : tableData.cities.filter(r => !tableState.hiddenIds.has(r.id ?? -1)), 
    [tableData.cities, tableState.hiddenIds, tableState.showHidden]
  );

  const onHeaderClick = (key: string) => {
    if (key === tableState.sortField) {
      tableState.setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      tableState.setSortField(key);
      tableState.setSortOrder('asc');
      tableState.setPageIndex(0);
    }
  };

  const hideRow = (id?: number | null) => {
    if (id != null) tableState.setHiddenIds(prev => new Set(prev).add(id));
  };

  const unhideRow = (id?: number | null) => {
    if (id == null) return;
    tableState.setHiddenIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const clearHidden = () => tableState.setHiddenIds(new Set());

  const commitPageInput = () => {
    const n = parseInt(tableState.pageInput.replace(/\D+/g, ''), 10);
    if (!Number.isFinite(n)) return;
    const tp = Math.max(1, tableData.totalPages || 1);
    const clamped = Math.min(Math.max(n, 1), tp);
    tableState.setPageIndex(clamped - 1);
  };

  const onResizeMove = React.useCallback((e: MouseEvent) => {
    const st = resizingRef.current;
    if (!st) return;
    const dx = e.clientX - st.startX;
    tableState.setColWidths(prev => ({ ...prev, [st.key]: Math.max(COL_MIN, st.startW + dx) }));
  }, [tableState]);

  const stopListenResize = React.useCallback(() => {
    resizingRef.current = null;
    document.removeEventListener("mousemove", onResizeMove);
    document.removeEventListener("mouseup", stopListenResize);
  }, [onResizeMove]);

  const startResize = (e: React.MouseEvent, key: string) => {
    e.preventDefault();
    e.stopPropagation();
    const startW = tableState.colWidths[key] ?? 160;
    resizingRef.current = { key, startX: e.clientX, startW };
    document.addEventListener("mousemove", onResizeMove);
    document.addEventListener("mouseup", stopListenResize);
  };

  const renderCell = (row: any, col: any, colIndex: number) => {
    const tdCls = `${cellBase} min-w-0`;
    const tdStyle: React.CSSProperties = {
      minWidth: 20,
      width: tableState.colWidths[col.key] ?? 160
    };
    const cellDelayClass = `table-cell-enter-delay-${Math.min((colIndex % 3) + 1, 3)}`;
    const wrap = (child: React.ReactNode, title?: string) => (
      <div className={`${cellDelayClass} truncate`} title={title}>{child}</div>
    );

    switch (col.key) {
      case 'id':
        return (
          <td key={`${row.id}-id`} className={`${tdCls} pl-6`} style={tdStyle}>
            {wrap(
              <span className={tableState.hiddenIds.has(row.id ?? -1) ? "line-through" : ""}>
                {row.id}
              </span>
            )}
          </td>
        );
      case 'ownerEmail':
        return (
          <td key={`${row.id}-ownerSub`} className={tdCls} style={tdStyle}>
            {wrap(row.ownerEmail ?? <span className="text-muted-foreground">—</span>, row.ownerEmail ?? "")}
          </td>
        );
      case 'name':
        return (
          <td key={`${row.id}-name`} className={`${tdCls} font-medium`} style={tdStyle}>
            {wrap(row.name ?? "—", row.name ?? "")}
          </td>
        );
      case 'coordinates':
        return (
          <td key={`${row.id}-coords`} className={tdCls} style={tdStyle}>
            <CoordinatesCell coords={row.coordinates} />
          </td>
        );
      case 'creationDate':
        return (
          <td key={`${row.id}-creationDate`} className={tdCls} style={tdStyle}>
            {wrap(formatDateReadable(row.creationDate))}
          </td>
        );
      case 'age':
        return (
          <td key={`${row.id}-age`} className={tdCls} style={tdStyle}>
            {wrap(`${row.age} лет`)}
          </td>
        );
      case 'creatureType':
        return (
          <td key={`${row.id}-creatureType`} className={tdCls} style={tdStyle}>
            {wrap(`${row.creatureType}`)}
          </td>
        );
      case 'creatureLocation':
        return (
          <td key={`${row.id}-creatureLocation`} className={tdCls} style={tdStyle}>
            <CreatureLocationCell creatureLocation={row.creatureLocation} />
          </td>
        );
      case 'attackLevel':
        return (
          <td key={`${row.id}-attackLevel`} className={tdCls} style={tdStyle}>
            {wrap(`${row.attackLevel}`)}
          </td>
        );
      case 'ring':
        return (
          <td key={`${row.id}-tz`} className={tdCls} style={tdStyle}>
            <RingCell ring={row.ring} />
          </td>
        );
      case "defenseLevel":
        return (
          <td key={`${row.id}-defenseLevel`} className={tdCls} style={tdStyle}>
            {wrap(`${row.defenseLevel}`)}
          </td>
        );
      default:
        return null;
    }
  };

  return (
    <RTooltip.Provider delayDuration={200}>
      <div className={`grid gap-3 ${animationsDisabled ? 'table-animations-disabled' : ''}`}>
        <TableControls
          sortField={tableState.sortField}
          sortOrder={tableState.sortOrder}
          onSortChange={onHeaderClick}
          onSortOrderToggle={() => tableState.setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'))}
          size={tableState.size}
          onSizeChange={(size) => {
            tableState.setSize(size);
            tableState.setPageIndex(0);
          }}
          hoverCardEnabled={tableState.hoverCardEnabled}
          onHoverCardToggle={tableState.setHoverCardEnabled}
          fullWidth={tableState.fullWidth}
          onFullWidthToggle={tableState.setFullWidth}
          showHidden={tableState.showHidden}
          onShowHiddenToggle={tableState.setShowHidden}
          hiddenCount={tableState.hiddenIds.size}
          onClearHidden={clearHidden}
          visibleColumns={tableState.visibleColumns}
          onVisibleColumnsChange={tableState.setVisibleColumns} 
        />

        <Pagination
          pageIndex={tableState.pageIndex}
          totalPages={tableData.totalPages}
          totalElements={tableData.totalElements}
          size={tableState.size}
          pageInput={tableState.pageInput}
          onPageInputChange={tableState.setPageInput}
          onPageChange={tableState.setPageIndex}
          onPageInputCommit={commitPageInput}
        />

        <div
          className={`table-wave-enter-delay-2 relative rounded-lg border border-border bg-background ${
            tableState.smartColumns ? "overflow-hidden" : "overflow-x-auto"
          } overflow-y-hidden overscroll-x-contain scroll-smooth`}
          style={tableState.fullWidth ? {
            width: "100vw",
            marginLeft: "calc(50% - 50vw)",
            marginRight: "calc(50% - 50vw)"
          } : undefined}
        >
          <table className="w-full border-separate border-spacing-0 text-left">
            <thead className="table-wave-enter sticky top-0 z-10 bg-muted/50 backdrop-blur supports-[backdrop-filter]:bg-muted/50">
              <tr className="[&>th]:border-b [&>th]:border-border">
                {allVisibleCols.map((col, index) => (
                  <th
                    key={col.key}
                    className={`table-wave-enter-delay-${Math.min(index + 1, 5)} ${headBase} relative ${col.key === 'id' ? 'pl-6' : ''}`}
                    style={{ minWidth: 20, width: tableState.colWidths[col.key] ?? 160 }}
                  >
                    <button 
                      className="flex w-full items-center justify-between gap-2"
                      onClick={() => onHeaderClick(col.key)}
                      title={`Сортировать по ${col.label}`}
                    >
                      <span className="truncate">{col.label}</span>
                      {tableState.sortField === col.key
                        ? (tableState.sortOrder === 'asc' ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />)
                        : <MoreHorizontal className="h-4 w-4 opacity-30 shrink-0" />}
                    </button>
                    <div
                      onMouseDown={(e) => startResize(e, col.key)}
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize select-none"
                      style={{ transform: "translateX(50%)" }}
                    />
                  </th>
                ))}
                <th className={`table-wave-enter-delay-5 ${headBase} min-w-0 pl-2`} style={{ width: 120 }}>Действия</th>
              </tr>
            </thead>

            <tbody>
              {dataForMeasure.length === 0 && (
                <tr>
                  <td 
                    className="px-3 py-6 text-center text-sm text-muted-foreground"
                    colSpan={1 + allVisibleCols.length}
                  >
                    Нет данных для отображения
                  </td>
                </tr>
              )}
              {(tableState.showHidden ? tableData.cities : tableData.cities.filter(r => !tableState.hiddenIds.has(r.id ?? -1))).map((row, index) => {
                const isHidden = tableState.hiddenIds.has(row.id ?? -1);
                const delayClass = `table-row-enter-delay-${Math.min((index % 5) + 1, 5)}`;
                return (
                  <tr
                    key={row.id}
                    className={`${delayClass} group ${isHidden ? "opacity-60" : "hover:bg-muted/40"}`}
                    onMouseEnter={(e) => tableState.hoverCardEnabled && setHover({
                      x: e.clientX,
                      y: e.clientY,
                      row
                    })}
                    onMouseMove={(e) => tableState.hoverCardEnabled && setHover({ x: e.clientX, y: e.clientY, row })}
                    onMouseLeave={() => setHover(null)}
                  >
                    {allVisibleCols.map((col, colIndex) => renderCell(row, col, colIndex))}
                    <td key={`${row.id}__actions`} className={`table-cell-enter-delay-3 ${cellBase} min-w-0 pl-2`} style={{ width: 120 }}>
                      <div className="flex items-center gap-1.5 justify-end">
                        <RTooltip.Root>
                          <RTooltip.Trigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="table-button-enter-delay-1 h-8 w-8"
                              onClick={() => (tableState.hiddenIds.has(row.id ?? -1) ? unhideRow(row.id) : hideRow(row.id))}
                              aria-label={tableState.hiddenIds.has(row.id ?? -1) ? "Показать" : "Скрыть"}
                            >
                              {tableState.hiddenIds.has(row.id ?? -1) ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>
                          </RTooltip.Trigger>
                          <RTooltip.Content
                            className="rounded-md border border-border bg-popover px-2 py-1 text-xs shadow-sm"
                            sideOffset={6}
                          >
                            {tableState.hiddenIds.has(row.id ?? -1) ? "Показать" : "Скрыть"}
                          </RTooltip.Content>
                        </RTooltip.Root>

                        <RTooltip.Root>
                          <RTooltip.Trigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="table-button-enter-delay-2 h-8 w-8"
                              disabled={!(row.ownerSub == user?.sub || user?.realm_access?.roles?.includes("admin"))}
                              onClick={() => (row.ownerSub == user?.sub || user?.realm_access?.roles?.includes("admin")) && setEditTarget(row)}
                              aria-label="Изменить"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </RTooltip.Trigger>
                          <RTooltip.Content
                            className="rounded-md border border-border bg-popover px-2 py-1 text-xs shadow-sm"
                            sideOffset={6}
                          >
                            {row.isYours ? "Изменить" : "Недоступно: чужой объект"}
                          </RTooltip.Content>
                        </RTooltip.Root>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="table-button-enter-delay-3 h-8 w-8" aria-label="Ещё">
                              <EllipsisVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              deleteOneById(row.id, accessToken).then(r => r);
                            }} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" /> Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {tableState.hoverCardEnabled && <RowHoverCard state={hover as any} />}
        </div>

        <div className="table-wave-enter-delay-3">
          <Pagination
            pageIndex={tableState.pageIndex}
            totalPages={tableData.totalPages}
            totalElements={tableData.totalElements}
            size={tableState.size}
            pageInput={tableState.pageInput}
            onPageInputChange={tableState.setPageInput}
            onPageChange={tableState.setPageIndex}
            onPageInputCommit={commitPageInput}
          />
        </div>
      </div>
      {editTarget && (
        <EditCityModal
          city={editTarget}
          open={true}
          onClose={() => setEditTarget(null)}
        />
      )}
    </RTooltip.Provider>
  );
}

export default Table;
