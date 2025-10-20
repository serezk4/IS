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
import {deleteOneByAttackLevel} from "@/app/utilities/providers/auth-provider/api-layer";

export function DeleteByAttackLevelModal({
                                           open,
                                           onOpenChange,
                                           onSuccess,
                                       }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onSuccess?: () => void;
}) {
    const {accessToken} = useTokenRotation();
    const [attackLevel, setAttackLevel] = useState<number>()
    const [pending, setPending] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const canSubmit = !!attackLevel && !pending;

    const run = async () => {
        setPending(true);
        setMessage(null);

        if (!attackLevel) {
            setMessage("Введите корректный уровень атаки");
            setPending(false);
            return;
        }

        const token = await accessToken;
        const res = await deleteOneByAttackLevel(attackLevel, token);

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
                    <DialogTitle>Удалить один объект по силе атаки</DialogTitle>
                    <DialogDescription>
                        Введите уровень атаки, чтобы удалить один объект с таким
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="attackLevel">Уровень атаки</Label>
                        <Input
                            id="attackLevel"
                            onChange={(e) => setAttackLevel(e.target.value)}
                            placeholder="0"
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

export default DeleteByAttackLevelModal;
