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
import {getUniqueDefenseLevels} from "@/app/utilities/providers/auth-provider/api-layer";

type Props = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
};

export default function UniqueDefenseLevelsDialog({ open, onOpenChange }: Props) {
    const { accessToken } = useTokenRotation();
    const [pending, setPending] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [levels, setLevels] = useState<number[]>([]);
    const [query, setQuery] = useState("");

    useEffect(() => {
        if (!open || !accessToken) return;
        let aborted = false;
        (async () => {
            setPending(true);
            setErr(null);
            try {
                const res = await getUniqueDefenseLevels(accessToken);
                if (aborted) return;
                const nums = (res ?? [])
                    .map((x: unknown) => Number(x))
                    .filter((n) => Number.isFinite(n));
                setLevels(nums);
            } catch {
                if (!aborted) setErr("Ошибка загрузки списка defenseLevel");
            } finally {
                if (!aborted) setPending(false);
            }
        })();
        return () => { aborted = true; };
    }, [open, accessToken]);

    const sorted = useMemo(
        () => [...levels].sort((a, b) => a - b),
        [levels]
    );

    const filtered = useMemo(() => {
        const q = query.trim();
        if (!q) return sorted;

        return sorted.filter((n) => String(n).startsWith(q) || n === Number(q));
    }, [sorted, query]);

    const copyToClipboard = async () => {
        const text = filtered.join("\n");
        await navigator.clipboard.writeText(text);
    };

    const downloadCsv = () => {
        const csv = "defenseLevel\n" + filtered.join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "unique-defense-levels.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Уникальные значения уровня защиты</DialogTitle>
                    <DialogDescription>
                        <div className="space-y-2">
                            <p>Можно экспортировать или фильтровать.</p>
                        </div>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Фильтр (например: 91. или 3)"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            disabled={pending}
                        />
                        <Button variant="outline" onClick={copyToClipboard} disabled={pending || filtered.length === 0}>
                            Копировать
                        </Button>
                        <Button onClick={downloadCsv} disabled={pending || filtered.length === 0}>
                            Экспорт CSV
                        </Button>
                    </div>

                    {pending ? (
                        <div className="text-sm text-muted-foreground">Загрузка…</div>
                    ) : err ? (
                        <div className="text-sm text-amber-600">{err}</div>
                    ) : filtered.length === 0 ? (
                        <div className="text-sm text-muted-foreground">Данных нет</div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border max-h-[50vh]">
                            <table className="min-w-full table-fixed">
                                <thead>
                                <tr className="bg-muted/40 text-left text-sm">
                                    <th className="px-4 py-2 w-full">defenseLevel</th>
                                </tr>
                                </thead>
                                <tbody className="text-sm">
                                {filtered.map((n, i) => (
                                    <tr key={`${n}-${i}`} className="border-t">
                                        <td className="px-4 py-2 tabular-nums">{n}</td>
                                    </tr>
                                ))}
                                </tbody>
                                <tfoot>
                                <tr className="border-t bg-muted/30 text-sm font-semibold">
                                    <td className="px-4 py-2">
                                        Всего: {filtered.length}
                                    </td>
                                </tr>
                                </tfoot>
                            </table>
                        </div>
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