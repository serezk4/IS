'use client';

import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useTokenRotation} from "@/app/utilities/providers/auth-provider/useTokenRotation";
import {City, getCities, normalizeWs, openCitiesSocket} from "@/app/utilities/providers/auth-provider/api-layer";
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Separator,
} from "@/shared/ui-toolkit";
import {
    ChevronDown,
    ChevronUp,
    Copy,
    EllipsisVertical,
    Eye,
    EyeOff,
    MoreHorizontal,
    Pencil,
    RefreshCw,
    Settings2,
    Trash2
} from "lucide-react";
import * as RTooltip from "@radix-ui/react-tooltip";
import EditCityModal from "@/shared/ui-toolkit/edit-city";
import {useAuthContext} from "@/app/utilities";

type SortOrder = 'asc' | 'desc';

const columnsDef = [
    {key: 'id', label: '#'},
    {key: 'ownerSub', label: 'владелец'},
    {key: 'name', label: 'название'},
    {key: 'coordinates', label: 'координаты'},
    {key: 'creationDate', label: 'создан'},
    {key: 'area', label: 'площадь'},
    {key: 'population', label: 'население'},
    {key: 'establishmentDate', label: 'построен'},
    {key: 'capital', label: 'capital'},
    {key: 'metersAboveSeaLevel', label: 'высота'},
    {key: 'timezone', label: 'часовой пояс'},
    {key: 'climate', label: 'климат'},
    {key: 'government', label: 'политика'},
    {key: 'governor', label: 'губернатор'},
] as const;

const cellBase = "border-b border-border px-3 py-2 align-middle";
const headBase = "h-10 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground select-none";
const ALL_TRUE = columnsDef.reduce((a, c) => ({...a, [c.key]: true}), {} as Record<string, boolean>);
const COL_MIN = 60;

type ColKey = typeof columnsDef[number]['key'];

function makePreset(keys: ColKey[]): Record<string, boolean> {
    const set = new Set(keys);
    return Object.fromEntries(columnsDef.map(c => [c.key, set.has(c.key as ColKey)]));
}

const PRESETS = {
    all: {...ALL_TRUE},
    minimum: makePreset(['id', 'name', 'population']),
    geo: makePreset(['name', 'coordinates', 'area', 'metersAboveSeaLevel', 'timezone']),
    info: makePreset(['id', 'name', 'creationDate', 'establishmentDate', 'capital', 'climate', 'government', 'governor']),
} as const;

type PresetName = keyof typeof PRESETS;

const RU_DATE = new Intl.DateTimeFormat('ru-RU', {day: '2-digit', month: '2-digit', year: 'numeric'});
const RU_DATE_TIME = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
});

function toEpochMs(v: unknown): number | null {
    if (v == null) return null;
    if (Array.isArray(v) && v.length >= 3 && v.every(n => Number.isFinite(n))) {
        const [y, m, d] = v as number[];
        return Date.UTC(Number(y), Number(m) - 1, Number(d));
    }
    if (typeof v === 'number') {
        if (v > 0 && v < 10000) return Date.UTC(Math.trunc(v), 0, 1);
        const asInt = Math.trunc(v);
        if (asInt >= 1_000_000_000 && asInt < 10_000_000_000) return Math.round(v * 1000);
        if (asInt >= 1_000_000_000_000) return asInt;
        if (asInt >= 1000 && asInt < 10000) return Date.UTC(asInt, 0, 1);
        return null;
    }
    if (typeof v === 'string') {
        const t = Date.parse(v);
        return Number.isNaN(t) ? null : t;
    }
    return null;
}

function formatDateReadable(v: unknown): string {
    const ms = toEpochMs(v);
    if (ms == null) return '—';
    const hasTime = (typeof v === 'number' && Math.trunc(v) >= 1_000_000_000) || (typeof v === 'string' && v.includes('T'));
    const dt = new Date(ms);
    return hasTime ? RU_DATE_TIME.format(dt) : RU_DATE.format(dt);
}

function CoordinatesCell({coords}: { coords?: any }) {
    if (!coords) return <span className="text-muted-foreground">—</span>;
    const x = coords.x, y = coords.y, r = 'r' in coords ? coords.r : undefined;
    const text = r !== undefined ? `x=${x}, y=${y}, r=${r}` : `x=${x}, y=${y}`;
    const copy = () => navigator.clipboard?.writeText(text).catch(() => {
    });
    const fmt = (v: number) => Number(v).toLocaleString();
    return (
        <div className="inline-flex items-center gap-2 max-w-full">
      <span
          className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[12px] font-mono max-w-full">
        <span className="shrink-0">x:</span><span className="tabular-nums truncate">{fmt(x)}</span>
        <span className="shrink-0">y:</span><span className="tabular-nums truncate">{fmt(y)}</span>
          {r !== undefined && (<><span className="shrink-0">r:</span><span
              className="tabular-nums truncate">{fmt(r)}</span></>)}
      </span>
            <RTooltip.Root>
                <RTooltip.Trigger asChild>
                    <button onClick={copy} className="rounded p-1 hover:bg-muted" aria-label="Скопировать координаты">
                        <Copy className="h-3.5 w-3.5 opacity-70"/>
                    </button>
                </RTooltip.Trigger>
                <RTooltip.Content className="rounded-md border border-border bg-popover px-2 py-1 text-xs shadow-sm"
                                  sideOffset={6}>
                    Скопировать
                </RTooltip.Content>
            </RTooltip.Root>
        </div>
    );
}

type HoverState = { x: number; y: number; row?: City } | null;

function RowHoverCard({state}: { state: HoverState }) {
    if (!state?.row) return null;
    const r = state.row;
    return (
        <div
            className="pointer-events-none fixed z-50 w-[420px] max-w-[90vw] rounded-md border border-border bg-popover p-3 text-sm shadow-md"
            style={{left: state.x + 12, top: state.y + 12}}>
            <div className="mb-2 text-xs font-semibold text-muted-foreground">Полная информация</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                <div className="text-muted-foreground">id</div>
                <div>{r.id}</div>
                <div className="text-muted-foreground">владелец</div>
                <div className="truncate">{r.ownerName ?? "—"}</div>
                <div className="text-muted-foreground">name</div>
                <div className="font-medium truncate">{r.name ?? "—"}</div>
                <div className="text-muted-foreground">coordinates</div>
                <div><CoordinatesCell coords={r.coordinates}/></div>
                <div className="text-muted-foreground">creationDate</div>
                <div>{formatDateReadable(r.creationDate)}</div>
                <div className="text-muted-foreground">area</div>
                <div>{r.area ?? "—"}</div>
                <div className="text-muted-foreground">population</div>
                <div>{(r as any)?.population?.toLocaleString?.() ?? r.population ?? "—"}</div>
                <div className="text-muted-foreground">establishmentDate</div>
                <div>{formatDateReadable(r.establishmentDate)}</div>
                <div className="text-muted-foreground">capital</div>
                <div>{r.capital ? "Yes" : "No"}</div>
                <div className="text-muted-foreground">metersAboveSeaLevel</div>
                <div>{r.metersAboveSeaLevel ?? "—"}</div>
                <div className="text-muted-foreground">timezone</div>
                <div>{r.timezone ?? "—"}</div>
                <div className="text-muted-foreground">climate</div>
                <div>{r.climate ?? "—"}</div>
                <div className="text-muted-foreground">government</div>
                <div>{r.government ?? "—"}</div>
                <div className="text-muted-foreground">governor</div>
                <div>{r.governor ? `Birthday: ${formatDateReadable(r.governor.birthday)}` : "—"}</div>
            </div>
        </div>
    );
}

type TableProps = { fullWidth?: boolean; smartColumns?: boolean; };

const Table: React.FC<TableProps> = ({fullWidth: fullWidthProp, smartColumns: smartColumnsProp}) => {
    const [smartColumnsState, setSmartColumnsState] = useState<boolean>(() => {
        if (smartColumnsProp !== undefined) return smartColumnsProp;
        if (typeof window === "undefined") return true;
        const saved = window.localStorage.getItem("smartColumns");
        return saved ? saved === "1" : true;
    });
    useEffect(() => {
        if (smartColumnsProp !== undefined) setSmartColumnsState(smartColumnsProp);
    }, [smartColumnsProp]);
    useEffect(() => {
        if (smartColumnsProp === undefined && typeof window !== "undefined") window.localStorage.setItem("smartColumns", smartColumnsState ? "1" : "0");
    }, [smartColumnsProp, smartColumnsState]);

    const [fullWidthState, setFullWidthState] = useState<boolean>(() => {
        if (fullWidthProp !== undefined) return fullWidthProp;
        if (typeof window === "undefined") return false;
        const saved = window.localStorage.getItem("tableFullWidth");
        return saved ? saved === "1" : false;
    });
    useEffect(() => {
        if (fullWidthProp !== undefined) setFullWidthState(fullWidthProp);
    }, [fullWidthProp]);
    useEffect(() => {
        if (fullWidthProp === undefined && typeof window !== "undefined") window.localStorage.setItem("tableFullWidth", fullWidthState ? "1" : "0");
    }, [fullWidthProp, fullWidthState]);

    const fullWidth = fullWidthState;
    const [sortField, setSortField] = useState<string>('id');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [cities, setCities] = useState<City[]>([]);
    const [size, setSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageInput, setPageInput] = useState("1");

    const [prevTail, setPrevTail] = useState<City | null>(null);
    const [nextHead, setNextHead] = useState<City | null>(null);

    const getFieldValue = (c: City, key: string) => {
        switch (key) {
            case 'id':
                return c.id ?? 0;
            case 'ownerSub':
                return c.ownerName ?? '';
            case 'name':
                return c.name ?? '';
            case 'area':
                return c.area ?? 0;
            case 'population':
                return c.population ?? 0;
            case 'creationDate':
                return toEpochMs(c.creationDate) ?? 0;
            case 'establishmentDate':
                return toEpochMs(c.establishmentDate) ?? 0;
            case 'governor':
                return toEpochMs(c.governor?.birthday) ?? 0;
            case 'capital':
                return c.capital ? 1 : 0;
            case 'metersAboveSeaLevel':
                return c.metersAboveSeaLevel ?? 0;
            case 'timezone':
                return c.timezone ?? 0;
            case 'climate':
                return c.climate ?? '';
            case 'government':
                return c.government ?? '';
            default:
                return (c as any)[key] ?? '';
        }
    };

    const cmp = (a: City, b: City, sortKey: string, order: SortOrder) => {
        const va = getFieldValue(a, sortKey);
        const vb = getFieldValue(b, sortKey);
        let r = 0;
        if (typeof va === 'number' && typeof vb === 'number') r = va - vb;
        else r = String(va).localeCompare(String(vb));
        if (r === 0) r = (a.id ?? 0) - (b.id ?? 0);
        return order === 'asc' ? r : -r;
    };

    const belongsByBoundaries = (item: City, prev: City | null, next: City | null) => {
        const gtPrev = prev ? cmp(item, prev, sortField, sortOrder) > 0 : true;
        const ltNext = next ? cmp(item, next, sortField, sortOrder) < 0 : true;
        return gtPrev && ltNext;
    };

    useEffect(() => {
        const sub = openCitiesSocket((raw) => {
            const {op, city: incoming, id: msgId} = normalizeWs(raw);
            if (!op) return;
            setCities((prev) => {
                const current = prev ?? [];
                if (op === 'delete') {
                    const delId = msgId ?? (incoming?.id != null ? Number(incoming.id) : undefined);
                    if (delId == null) return current;
                    const idx = current.findIndex(c => Number(c.id) === delId);
                    if (idx === -1) return current;
                    const nextArr = current.slice();
                    nextArr.splice(idx, 1);
                    setTotalElements(t => Math.max(0, t - 1));
                    return nextArr;
                }
                if (!incoming || incoming.id == null) return current;
                const inId = Number(incoming.id);
                const idx = current.findIndex(c => Number(c.id) === inId);
                if (idx !== -1) {
                    const nextArr = current.slice();
                    nextArr[idx] = {...current[idx], ...incoming};
                    nextArr.sort((a, b) => cmp(a, b, sortField, sortOrder));
                    return nextArr;
                }
                if (!belongsByBoundaries(incoming, prevTail, nextHead)) return current;
                const nextArr = current.concat(incoming).sort((a, b) => cmp(a, b, sortField, sortOrder));
                if (nextArr.length > size) nextArr.pop();
                if (op === 'create') setTotalElements(t => t + 1);
                return nextArr;
            });
        });
        return () => sub.close();
    }, [prevTail, nextHead, size, sortField, sortOrder]);

    const {accessToken} = useTokenRotation();
    const sortParam = useMemo(() => `${sortField},${sortOrder}`, [sortOrder, sortField]);
    const abortRef = useRef<AbortController | null>(null);

    const loadPage = React.useCallback((pageIdx: number, pageSize: number, sort: string) => {
        if (!accessToken) return;
        abortRef.current?.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;
        getCities(accessToken, pageIdx, pageSize, sort, {signal: ctrl.signal})
            .then(res => {
                if (!res || ctrl.signal.aborted) return;
                setCities(res.content ?? []);
                setTotalElements(res.totalElements ?? 0);
                setTotalPages(res.totalPages ?? 0);
                setPageIndex(res.page);
            })
            .catch(() => {
            })
            .finally(() => {
            });
        return () => ctrl.abort();
    }, [accessToken]);

    useEffect(() => {
        loadPage(pageIndex, size, sortParam);
    }, [loadPage, pageIndex, size, sortParam]);

    useEffect(() => {
        let aborted = false;
        const fetchBoundaries = async () => {
            if (pageIndex > 0) {
                const prev = await getCities(accessToken, pageIndex - 1, size, sortParam).catch(() => undefined);
                if (!aborted) setPrevTail(prev?.content?.length ? prev.content[prev.content.length - 1] : null);
            } else setPrevTail(null);
            if (totalPages && pageIndex < totalPages - 1) {
                const next = await getCities(accessToken, pageIndex + 1, size, sortParam).catch(() => undefined);
                if (!aborted) setNextHead(next?.content?.length ? next.content[0] : null);
            } else setNextHead(null);
        };
        if (cities.length) fetchBoundaries();
        return () => {
            aborted = true;
        };
    }, [accessToken, cities.length, pageIndex, size, sortParam, totalPages]);

    useEffect(() => {
        setPageInput(String((totalPages ? Math.min(pageIndex, totalPages - 1) : pageIndex) + 1));
    }, [pageIndex, totalPages]);

    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
        if (typeof window !== "undefined") {
            const saved = window.localStorage.getItem("tableVisibleColumns");
            if (saved) try {
                return JSON.parse(saved);
            } catch {
            }
        }
        return {...ALL_TRUE};
    });
    useEffect(() => {
        if (typeof window !== "undefined") window.localStorage.setItem("tableVisibleColumns", JSON.stringify(visibleColumns));
    }, [visibleColumns]);
    const [hiddenIds, setHiddenIds] = useState<Set<number>>(new Set());
    const [showHidden, setShowHidden] = useState(false);
    const [hoverCardEnabled, setHoverCardEnabled] = useState(true);
    const [hover, setHover] = useState<HoverState>(null);

    const applyPreset = (name: PresetName) => setVisibleColumns({...PRESETS[name]});

    const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
        if (typeof window !== "undefined") {
            const saved = window.localStorage.getItem("tableColWidths");
            if (saved) try {
                return JSON.parse(saved);
            } catch {
            }
        }
        return Object.fromEntries(columnsDef.map(c => [c.key, 160]));
    });
    useEffect(() => {
        if (typeof window !== "undefined") window.localStorage.setItem("tableColWidths", JSON.stringify(colWidths));
    }, [colWidths]);

    const resizingRef = useRef<{ key: string; startX: number; startW: number } | null>(null);
    const onResizeMove = React.useCallback((e: MouseEvent) => {
        const st = resizingRef.current;
        if (!st) return;
        const dx = e.clientX - st.startX;
        setColWidths(prev => ({...prev, [st.key]: Math.max(COL_MIN, st.startW + dx)}));
    }, []);
    const stopListenResize = React.useCallback(() => {
        resizingRef.current = null;
        document.removeEventListener("mousemove", onResizeMove);
        document.removeEventListener("mouseup", stopListenResize);
    }, [onResizeMove]);
    const startResize = (e: React.MouseEvent, key: string) => {
        e.preventDefault();
        e.stopPropagation();
        const startW = colWidths[key] ?? 160;
        resizingRef.current = {key, startX: e.clientX, startW};
        document.addEventListener("mousemove", onResizeMove);
        document.addEventListener("mouseup", stopListenResize);
    };

    const smartColumns = smartColumnsState;

    const onHeaderClick = (key: string) => {
        if (key === sortField) setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'));
        else {
            setSortField(key);
            setSortOrder('asc');
            setPageIndex(0);
        }
    };

    const hideRow = (id?: number | null) => {
        if (id != null) setHiddenIds(prev => new Set(prev).add(id));
    };
    const unhideRow = (id?: number | null) => {
        if (id == null) return;
        setHiddenIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };
    const clearHidden = () => setHiddenIds(new Set());
    const [editTarget, setEditTarget] = useState<City | null>(null);

    const allVisibleCols = useMemo(() => columnsDef.filter(c => visibleColumns[c.key]), [visibleColumns]);
    const dataForMeasure = useMemo(() => (showHidden ? cities : cities.filter(r => !hiddenIds.has(r.id ?? -1))), [cities, hiddenIds, showHidden]);

    const commitPageInput = () => {
        const n = parseInt(pageInput.replace(/\D+/g, ''), 10);
        if (!Number.isFinite(n)) return;
        const tp = Math.max(1, totalPages || 1);
        const clamped = Math.min(Math.max(n, 1), tp);
        setPageIndex(clamped - 1);
    };

    const {user} = useAuthContext()

    return (
        <RTooltip.Provider delayDuration={200}>
            <div className="grid gap-3">
                <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background p-2.5">
                    <div className="text-sm font-medium">Управление</div>
                    <Separator orientation="vertical" className="h-6"/>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Сортировка:</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{sortField}</span>
                            <Button variant="outline" size="sm"
                                    onClick={() => setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'))}
                                    className="h-8 px-2">
                                {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4"/> :
                                    <ChevronDown className="h-4 w-4"/>}
                                <span className="ml-1 text-xs">{sortOrder.toUpperCase()}</span>
                            </Button>
                        </div>
                    </div>
                    <Separator orientation="vertical" className="h-6"/>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Размер:</span>
                        <select
                            value={size}
                            onChange={e => {
                                setSize(Number(e.target.value));
                                setPageIndex(0);
                            }}
                            className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                        >
                            {[10, 20, 50, 100].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <Separator orientation="vertical" className="h-6"/>
                    <label className="flex select-none items-center gap-2 text-sm">
                        <input type="checkbox" className="h-4 w-4 accent-foreground" checked={hoverCardEnabled}
                               onChange={e => setHoverCardEnabled(e.target.checked)}/>
                        Ховер
                    </label>
                    <Separator orientation="vertical" className="h-6"/>
                    <label className="flex select-none items-center gap-2 text-sm">
                        <input type="checkbox" className="h-4 w-4 accent-foreground" checked={fullWidth}
                               onChange={e => setFullWidthState(e.target.checked)}/>
                        Вся ширина
                    </label>
                    <div className="ml-auto flex items-center gap-3">
                        <label className="flex select-none items-center gap-2 text-sm">
                            <input type="checkbox" className="h-4 w-4 accent-foreground" checked={showHidden}
                                   onChange={e => setShowHidden(e.target.checked)}/>
                            Показать скрытые
                        </label>
                        <Button variant="outline" size="sm" onClick={clearHidden} className="h-8 px-2 gap-1"
                                disabled={hiddenIds.size === 0}>
                            <RefreshCw className="h-4 w-4"/><span
                            className="text-xs">Очистить скрытые ({hiddenIds.size})</span>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 px-2 gap-2">
                                    <Settings2 className="h-4 w-4"/>Колонки
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64">
                                <DropdownMenuLabel>Пресеты</DropdownMenuLabel>
                                <DropdownMenuSeparator/>
                                <div className="grid grid-cols-2 gap-2 px-2 py-1">
                                    <Button variant="secondary" size="sm"
                                            onClick={() => applyPreset('minimum')}>Минимум</Button>
                                    <Button variant="secondary" size="sm"
                                            onClick={() => applyPreset('geo')}>Гео</Button>
                                    <Button variant="secondary" size="sm"
                                            onClick={() => applyPreset('info')}>Инфо</Button>
                                    <Button variant="secondary" size="sm"
                                            onClick={() => applyPreset('all')}>Все</Button>
                                </div>
                                <DropdownMenuSeparator/>
                                <DropdownMenuLabel>Видимость колонок</DropdownMenuLabel>
                                <DropdownMenuSeparator/>
                                {columnsDef.map(col => (
                                    <DropdownMenuItem key={col.key} onSelect={(e) => e.preventDefault()}
                                                      className="flex items-center justify-between gap-2">
                                        <span className="text-sm">{col.label}</span>
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 accent-foreground"
                                            checked={!!visibleColumns[col.key]}
                                            onChange={() => setVisibleColumns(prev => ({
                                                ...prev,
                                                [col.key]: !prev[col.key]
                                            }))}
                                        />
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="justify-between">
                                    <Button variant="outline" size="sm" className="w-full"
                                            onClick={() => setVisibleColumns({...ALL_TRUE})}>
                                        Восстановить все
                                    </Button>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Button variant="outline" size="sm" className="h-8 px-3" onClick={() => setPageIndex(0)}
                            disabled={pageIndex <= 0}>« Первая</Button>
                    <Button variant="outline" size="sm" className="h-8 px-3"
                            onClick={() => setPageIndex(p => Math.max(0, p - 1))} disabled={pageIndex <= 0}>‹
                        Предыдущая</Button>
                    <div className="flex items-center gap-2">
                        <span>Стр.</span>
                        <input
                            value={pageInput}
                            onChange={e => setPageInput(e.target.value)}
                            onBlur={commitPageInput}
                            onKeyDown={e => {
                                if (e.key === 'Enter') commitPageInput();
                            }}
                            className="h-8 w-16 rounded-md border border-input bg-background px-2 text-center"
                            inputMode="numeric"
                            aria-label="Номер страницы"
                        />
                        <span>из {totalPages || 1}</span>
                    </div>
                    <span
                        className="mx-2 hidden md:inline">• Показано {(pageIndex * size + 1)}–{Math.min((pageIndex + 1) * size, totalElements)} из {totalElements}</span>
                    <Button variant="outline" size="sm" className="h-8 px-3"
                            onClick={() => setPageIndex(p => Math.min((totalPages || 1) - 1, p + 1))}
                            disabled={totalPages === 0 || pageIndex >= (totalPages - 1)}>Следующая ›</Button>
                    <Button variant="outline" size="sm" className="h-8 px-3"
                            onClick={() => setPageIndex(Math.max(0, (totalPages || 1) - 1))}
                            disabled={totalPages === 0 || pageIndex >= (totalPages - 1)}>Последняя »</Button>
                </div>

                <div
                    className={`relative rounded-lg border border-border bg-background ${smartColumns ? "overflow-hidden" : "overflow-x-auto"} overflow-y-hidden overscroll-x-contain scroll-smooth`}
                    style={fullWidth ? {
                        width: "100vw",
                        marginLeft: "calc(50% - 50vw)",
                        marginRight: "calc(50% - 50vw)"
                    } : undefined}
                >
                    <table className="w-full border-separate border-spacing-0 text-left">
                        <thead
                            className="sticky top-0 z-10 bg-muted/50 backdrop-blur supports-[backdrop-filter]:bg-muted/50">
                        <tr className="[&>th]:border-b [&>th]:border-border">
                            {allVisibleCols.map((col) => (
                                <th
                                    key={col.key}
                                    className={`${headBase} relative ${col.key === 'id' ? 'pl-6' : ''}`}
                                    style={{minWidth: 20, width: colWidths[col.key] ?? 160}}
                                >
                                    <button className="flex w-full items-center justify-between gap-2"
                                            onClick={() => onHeaderClick(col.key)}
                                            title={`Сортировать по ${col.label}`}>
                                        <span className="truncate">{col.label}</span>
                                        {sortField === col.key
                                            ? (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4 shrink-0"/> :
                                                <ChevronDown className="h-4 w-4 shrink-0"/>)
                                            : <MoreHorizontal className="h-4 w-4 opacity-30 shrink-0"/>}
                                    </button>
                                    <div
                                        onMouseDown={(e) => startResize(e, col.key)}
                                        className="absolute right-0 top-0 h-full w-1 cursor-col-resize select-none"
                                        style={{transform: "translateX(50%)"}}
                                    />
                                </th>
                            ))}
                            <th className={`${headBase} min-w-0 pl-2`} style={{width: 120}}>Действия</th>
                        </tr>
                        </thead>

                        <tbody>
                        {dataForMeasure.length === 0 && (
                            <tr>
                                <td className="px-3 py-6 text-center text-sm text-muted-foreground"
                                    colSpan={1 + allVisibleCols.length}>
                                    Нет данных для отображения
                                </td>
                            </tr>
                        )}
                        {(showHidden ? cities : cities.filter(r => !hiddenIds.has(r.id ?? -1))).map((row) => {
                            const isHidden = hiddenIds.has(row.id ?? -1);
                            return (
                                <tr
                                    key={row.id}
                                    className={`group ${isHidden ? "opacity-60" : "hover:bg-muted/40"}`}
                                    onMouseEnter={(e) => hoverCardEnabled && setHover({
                                        x: e.clientX,
                                        y: e.clientY,
                                        row
                                    })}
                                    onMouseMove={(e) => hoverCardEnabled && setHover({x: e.clientX, y: e.clientY, row})}
                                    onMouseLeave={() => setHover(null)}
                                >
                                    {allVisibleCols.map((col) => {
                                        const tdCls = `${cellBase} min-w-0`;
                                        const tdStyle: React.CSSProperties = {
                                            minWidth: 20,
                                            width: colWidths[col.key] ?? 160
                                        };
                                        const wrap = (child: React.ReactNode, title?: string) => <div
                                            className="truncate" title={title}>{child}</div>;
                                        switch (col.key) {
                                            case 'id':
                                                return (
                                                    <td key={`${row.id}-id`} className={`${tdCls} pl-6`}
                                                        style={tdStyle}>
                                                        {wrap(<span
                                                            className={isHidden ? "line-through" : ""}>{row.id}</span>)}
                                                    </td>
                                                );
                                            case 'ownerSub':
                                                return (
                                                    <td key={`${row.id}-ownerSub`} className={tdCls} style={tdStyle}>
                                                        {wrap(row.ownerName ?? <span
                                                            className="text-muted-foreground">—</span>, row.ownerName ?? "")}
                                                    </td>
                                                );
                                            case 'name':
                                                return (
                                                    <td key={`${row.id}-name`} className={`${tdCls} font-medium`}
                                                        style={tdStyle}>
                                                        {wrap(row.name ?? "—", row.name ?? "")}
                                                    </td>
                                                );
                                            case 'coordinates':
                                                return (
                                                    <td key={`${row.id}-coords`} className={tdCls} style={tdStyle}>
                                                        <CoordinatesCell coords={row.coordinates}/>
                                                    </td>
                                                );
                                            case 'creationDate':
                                                return (
                                                    <td key={`${row.id}-creationDate`} className={tdCls}
                                                        style={tdStyle}>
                                                        {wrap(formatDateReadable(row.creationDate))}
                                                    </td>
                                                );
                                            case 'area':
                                                return (
                                                    <td key={`${row.id}-area`} className={tdCls} style={tdStyle}>
                                                        {wrap(`${row.area} кв.км` ??
                                                            <span className="text-muted-foreground">—</span>)}
                                                    </td>
                                                );
                                            case 'population':
                                                return (
                                                    <td key={`${row.id}-population`} className={tdCls} style={tdStyle}>
                                                        {wrap(`${row.population} чел`)}
                                                    </td>
                                                );
                                            case 'establishmentDate':
                                                return (
                                                    <td key={`${row.id}-establishmentDate`} className={tdCls}
                                                        style={tdStyle}>
                                                        {wrap(formatDateReadable(row.establishmentDate))}
                                                    </td>
                                                );
                                            case 'capital':
                                                return (
                                                    <td key={`${row.id}-capital`} className={tdCls} style={tdStyle}>
                                                        {wrap(
                                                            <span className={row.capital
                                                                ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                                                : "rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-foreground/70"}>
                                {row.capital ? 'Yes' : 'No'}
                              </span>
                                                        )}
                                                    </td>
                                                );
                                            case 'metersAboveSeaLevel':
                                                return (
                                                    <td key={`${row.id}-masl`} className={tdCls} style={tdStyle}>
                                                        {wrap(`${row.metersAboveSeaLevel} м` ?? "—")}
                                                    </td>
                                                );
                                            case 'timezone':
                                                return (
                                                    <td key={`${row.id}-tz`} className={tdCls} style={tdStyle}>
                                                        {wrap(row.timezone ?? "—")}
                                                    </td>
                                                );
                                            case 'climate':
                                                return (
                                                    <td key={`${row.id}-climate`} className={tdCls} style={tdStyle}>
                                                        {wrap(row.climate ?? "—")}
                                                    </td>
                                                );
                                            case 'government':
                                                return (
                                                    <td key={`${row.id}-gov`} className={tdCls} style={tdStyle}>
                                                        {wrap(row.government ?? "—")}
                                                    </td>
                                                );
                                            case 'governor':
                                                return (
                                                    <td key={`${row.id}-governor`} className={tdCls} style={tdStyle}>
                                                        {wrap(
                                                            row.governor
                                                                ? <span
                                                                    className="text-sm">др: {formatDateReadable(row.governor.birthday)}</span>
                                                                : <span
                                                                    className="text-muted-foreground">Нет данных</span>
                                                        )}
                                                    </td>
                                                );
                                            default:
                                                return null;
                                        }
                                    })}
                                    <td key={`${row.id}__actions`} className={`${cellBase} min-w-0 pl-2`}
                                        style={{width: 120}}>
                                        <div className="flex items-center gap-1.5 justify-end">
                                            <RTooltip.Root>
                                                <RTooltip.Trigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8"
                                                            onClick={() => (hiddenIds.has(row.id ?? -1) ? unhideRow(row.id) : hideRow(row.id))}
                                                            aria-label={hiddenIds.has(row.id ?? -1) ? "Показать" : "Скрыть"}>
                                                        {hiddenIds.has(row.id ?? -1) ? <Eye className="h-4 w-4"/> :
                                                            <EyeOff className="h-4 w-4"/>}
                                                    </Button>
                                                </RTooltip.Trigger>
                                                <RTooltip.Content
                                                    className="rounded-md border border-border bg-popover px-2 py-1 text-xs shadow-sm"
                                                    sideOffset={6}>
                                                    {hiddenIds.has(row.id ?? -1) ? "Показать" : "Скрыть"}
                                                </RTooltip.Content>
                                            </RTooltip.Root>

                                            <RTooltip.Root>
                                                <RTooltip.Trigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        disabled={(!(row.ownerSub == user?.sub || user?.realm_access?.roles?.includes("admin")))}
                                                        onClick={() => (row.ownerSub == user?.sub || user?.realm_access?.roles?.includes("admin")) && setEditTarget(row)}
                                                        aria-label="Изменить"
                                                    >
                                                        <Pencil className="h-4 w-4"/>
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
                                                    <Button variant="ghost" size="icon" className="h-8 w-8"
                                                            aria-label="Ещё">
                                                        <EllipsisVertical className="h-4 w-4"/>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => {
                                                    }} className="text-red-600">
                                                        <Trash2 className="mr-2 h-4 w-4"/> Удалить
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
                    {hoverCardEnabled && <RowHoverCard state={hover}/>}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Button variant="outline" size="sm" className="h-8 px-3" onClick={() => setPageIndex(0)}
                            disabled={pageIndex <= 0}>« Первая</Button>
                    <Button variant="outline" size="sm" className="h-8 px-3"
                            onClick={() => setPageIndex(p => Math.max(0, p - 1))} disabled={pageIndex <= 0}>‹
                        Предыдущая</Button>
                    <div className="flex items-center gap-2">
                        <span>Стр.</span>
                        <input
                            value={pageInput}
                            onChange={e => setPageInput(e.target.value)}
                            onBlur={commitPageInput}
                            onKeyDown={e => {
                                if (e.key === 'Enter') commitPageInput();
                            }}
                            className="h-8 w-16 rounded-md border border-input bg-background px-2 text-center"
                            inputMode="numeric"
                            aria-label="Номер страницы"
                        />
                        <span>из {totalPages || 1}</span>
                    </div>
                    <span
                        className="mx-2 hidden md:inline">• Показано {(pageIndex * size + 1)}–{Math.min((pageIndex + 1) * size, totalElements)} из {totalElements}</span>
                    <Button variant="outline" size="sm" className="h-8 px-3"
                            onClick={() => setPageIndex(p => Math.min((totalPages || 1) - 1, p + 1))}
                            disabled={totalPages === 0 || pageIndex >= (totalPages - 1)}>Следующая ›</Button>
                    <Button variant="outline" size="sm" className="h-8 px-3"
                            onClick={() => setPageIndex(Math.max(0, (totalPages || 1) - 1))}
                            disabled={totalPages === 0 || pageIndex >= (totalPages - 1)}>Последняя »</Button>
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
};

export default Table;
