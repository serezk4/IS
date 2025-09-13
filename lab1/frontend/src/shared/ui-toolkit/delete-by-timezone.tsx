'use client';

import React, {useState} from "react";
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
} from "@/shared/ui-toolkit";
import {useTokenRotation} from "@/app/utilities/providers/auth-provider/useTokenRotation";
import {deleteAllByTimezone} from "@/app/utilities/providers/auth-provider/api-layer";

export function DeleteByTimezoneModal({
                                          open,
                                          onOpenChange,
                                          onSuccess,
                                      }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onSuccess?: () => void;
}) {
    const {accessToken} = useTokenRotation();
    const [timezone, setTimezone] = useState<string>("");
    const [pending, setPending] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const canSubmit = !!timezone && !pending;

    const run = async () => {
        if (!timezone.trim()) {
            setMessage("Укажите таймзону (например, 3, 5 или -2)");
            return;
        }
        if (timezone.trim().length > 3 || isNaN(Number(timezone.trim()))) {
            setMessage("Таймзона должна быть числом от -12 до 14");
            return;
        }
        setPending(true);
        setMessage(null);

        const token = await accessToken;
        const res = await deleteAllByTimezone(Number(timezone.trim()), token);

        setPending(false);

        if (res?.ok) {
            setMessage(res.message || "Объект удалён");
            onSuccess?.();
            onOpenChange(false);
        } else {
            setMessage(
                `${res?.message || "Удаление не выполнено"}${
                    res?.errorCode ? ` (код: ${res.errorCode})` : ""
                }`
            );
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Удалить один объект по таймзоне</DialogTitle>
                    <DialogDescription>
                        Введите таймзону. Будет удалён один объект, соответствующий указанной таймзоне.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="timezone">Таймзона</Label>
                        <Input
                            id="timezone"
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            placeholder="Например: 3"
                        />
                    </div>

                    {message && (
                        <div className="rounded border p-2 text-sm">
                            {message}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="secondary"
                        onClick={() => onOpenChange(false)}
                        disabled={pending}
                    >
                        Отмена
                    </Button>
                    <Button onClick={run} disabled={!canSubmit}>
                        {pending ? "Выполняется..." : "Удалить"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default DeleteByTimezoneModal;
