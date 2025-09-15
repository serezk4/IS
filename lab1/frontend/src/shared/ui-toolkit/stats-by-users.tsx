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
} from "@/shared/ui-toolkit";
import {useTokenRotation} from "@/app/utilities/providers/auth-provider/useTokenRotation";
import {objectsPerUserStats} from "@/app/utilities/providers/auth-provider/api-layer";

export interface ObjectsPerUserStats {
    userEmail: string;
    objectCount: number;
}

function normalizeStats(res: any): ObjectsPerUserStats[] {
    const arr = Array.isArray(res) ? res : Array.isArray(res?.stats) ? res.stats : [];
    return arr.map((x: any) => ({
        userEmail: String(x.userEmail ?? x.email ?? ""),
        objectCount: Number(x.objectCount ?? x.count ?? 0),
    })).filter(r => r.userEmail.length > 0);
}

export function StatsByUsers({
                                 open,
                                 onOpenChange,
                                 onSuccess,
                             }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onSuccess?: () => void;
}) {
    const {accessToken} = useTokenRotation();
    const [pending, setPending] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [rows, setRows] = useState<ObjectsPerUserStats[]>([]);

    useEffect(() => {
        if (!open || !accessToken) return;
        let aborted = false;
        (async () => {
            setPending(true);
            setMessage(null);
            try {
                const res = await objectsPerUserStats(accessToken);
                if (aborted) return;
                const data = normalizeStats(res);
                setRows(data);
                if (data.length === 0) setMessage("Данных нет");
            } catch {
                if (!aborted) setMessage("Ошибка загрузки статистики");
            } finally {
                if (!aborted) setPending(false);
            }
        })();
        return () => {
            aborted = true;
        };
    }, [open, accessToken]);

    const sorted = useMemo(
        () => [...rows].sort((a, b) => b.objectCount - a.objectCount),
        [rows]
    );
    const totalObjects = useMemo(
        () => sorted.reduce((acc, r) => acc + (r.objectCount || 0), 0),
        [sorted]
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Статистика по владельцам объектов</DialogTitle>
                    <DialogDescription>
                        <div className="space-y-2">
                            <p>Сводная таблица количества объектов по email владельцев.</p>
                        </div>
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-2">
                    {pending ? (
                        <div className="text-sm text-muted-foreground">Загрузка…</div>
                    ) : message ? (
                        <div className="text-sm text-amber-600">{message}</div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border">
                            <table className="min-w-full table-fixed">
                                <thead>
                                <tr className="bg-muted/40 text-left text-sm">
                                    <th className="px-4 py-2 w-2/3">Email владельца</th>
                                    <th className="px-4 py-2 w-1/3">Количество объектов</th>
                                </tr>
                                </thead>
                                <tbody className="text-sm">
                                {sorted.map((r) => (
                                    <tr key={r.userEmail} className="border-t">
                                        <td className="px-4 py-2 truncate font-medium">{r.userEmail}</td>
                                        <td className="px-4 py-2 tabular-nums">{r.objectCount}</td>
                                    </tr>
                                ))}
                                </tbody>
                                <tfoot>
                                <tr className="border-t bg-muted/30 text-sm font-semibold">
                                    <td className="px-4 py-2">Итого</td>
                                    <td className="px-4 py-2 tabular-nums">{totalObjects}</td>
                                </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            onOpenChange(false);
                            onSuccess?.();
                        }}
                        disabled={pending}
                    >
                        Закрыть
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default StatsByUsers;