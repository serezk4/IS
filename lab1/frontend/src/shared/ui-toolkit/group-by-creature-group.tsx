'use client';

import React, {useEffect, useMemo, useState} from "react";
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
} from "@/shared/ui-toolkit";
import {useTokenRotation} from "@/app/utilities/providers/auth-provider/useTokenRotation";
import {getGroupByCreatureType} from "@/app/utilities/providers/auth-provider/api-layer";

export enum BookCreatureType {
    HOBBIT = "HOBBIT",
    ELF = "ELF",
    HUMAN = "HUMAN",
}

export interface GroupedByCreatureTypeDto {
    creatureType: BookCreatureType;
    count: number;
}

type Props = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
};

export default function GroupByCreatureTypeDialog({ open, onOpenChange }: Props) {
    const { accessToken } = useTokenRotation();
    const [pending, setPending] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [rows, setRows] = useState<GroupedByCreatureTypeDto[]>([]);
    const [q, setQ] = useState("");

    useEffect(() => {
        if (!open || !accessToken) return;
        let aborted = false;
        (async () => {
            setPending(true);
            setErr(null);
            try {
                const res = await getGroupByCreatureType(accessToken);
                if (aborted) return;
                if (!res) return;
                setRows(res);
                if (res.length === 0) setErr("Данных нет");
            } catch {
                if (!aborted) setErr("Ошибка загрузки группировки");
            } finally {
                if (!aborted) setPending(false);
            }
        })();
        return () => { aborted = true; };
    }, [open, accessToken]);

    const sorted = useMemo(
        () => [...rows].sort((a, b) => b.count - a.count),
        [rows]
    );

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        if (!term) return sorted;
        return sorted.filter(x => String(x.creatureType).toLowerCase().includes(term));
    }, [sorted, q]);

    const total = useMemo(
        () => filtered.reduce((acc, r) => acc + (r.count || 0), 0),
        [filtered]
    );
    const maxCount = useMemo(
        () => Math.max(1, ...filtered.map(r => r.count || 0)),
        [filtered]
    );

    const copyCSV = async () => {
        const csv = ["creatureType,count", ...filtered.map(r => `${r.creatureType},${r.count}`)].join("\n");
        await navigator.clipboard.writeText(csv);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Группировка по типу создания</DialogTitle>
                    <DialogDescription>
                        <div className="space-y-2">
                            <p>Количество объектов для каждого типа создания.</p>
                        </div>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Фильтр по типу (например: ELF)"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            disabled={pending}
                        />
                        <Button variant="outline" onClick={copyCSV} disabled={pending || filtered.length === 0}>
                            Копировать CSV
                        </Button>
                    </div>

                    {pending ? (
                        <div className="text-sm text-muted-foreground">Загрузка…</div>
                    ) : err ? (
                        <div className="text-sm text-amber-600">{err}</div>
                    ) : (
                        <>
                            {/* Мини-барчарт */}
                            <div className="space-y-2">
                                {filtered.map((r) => {
                                    const pct = total > 0 ? (r.count / total) * 100 : 0;
                                    const widthPct = (r.count / maxCount) * 100;
                                    return (
                                        <div key={r.creatureType}>
                                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                <span className="font-medium">{r.creatureType}</span>
                                                <span className="tabular-nums">{r.count} ({pct.toFixed(1)}%)</span>
                                            </div>
                                            <div className="h-2 w-full rounded bg-muted/40 overflow-hidden">
                                                <div
                                                    className="h-2 rounded bg-primary/70"
                                                    style={{ width: `${widthPct}%` }}
                                                    aria-label={`${r.creatureType}: ${r.count}`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Таблица */}
                            <div className="overflow-x-auto rounded-xl border mt-3">
                                <table className="min-w-full table-fixed">
                                    <thead>
                                    <tr className="bg-muted/40 text-left text-sm">
                                        <th className="px-4 py-2 w-1/2">creatureType</th>
                                        <th className="px-4 py-2 w-1/4">count</th>
                                        <th className="px-4 py-2 w-1/4">% от выборки</th>
                                    </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                    {filtered.map((r) => (
                                        <tr key={`row-${r.creatureType}`} className="border-t">
                                            <td className="px-4 py-2 font-medium">{r.creatureType}</td>
                                            <td className="px-4 py-2 tabular-nums">{r.count}</td>
                                            <td className="px-4 py-2 tabular-nums">
                                                {total > 0 ? ((r.count / total) * 100).toFixed(1) : "0.0"}%
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                    <tfoot>
                                    <tr className="border-t bg-muted/30 text-sm font-semibold">
                                        <td className="px-4 py-2">Итого</td>
                                        <td className="px-4 py-2 tabular-nums">{total}</td>
                                        <td className="px-4 py-2 tabular-nums">100.0%</td>
                                    </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={pending}>
                        Закрыть
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}