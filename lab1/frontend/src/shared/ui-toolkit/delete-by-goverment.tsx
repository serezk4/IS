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
import {deleteOneByGovernment} from "@/app/utilities/providers/auth-provider/api-layer";

export function DeleteByGovermentModal({
                                           open,
                                           onOpenChange,
                                           onSuccess,
                                       }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onSuccess?: () => void;
}) {
    const {accessToken} = useTokenRotation();
    const [government, setGovernment] = useState<string>("");
    const [pending, setPending] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const canSubmit = !!government && !pending;

    const run = async () => {
        if (!government.trim()) {
            setMessage("Укажите тип правления: PUPPET_STATE, THALASSOCRACY или TELLUROCRACY)");
            return;
        }
        setPending(true);
        setMessage(null);

        const token = await accessToken;
        const res = await deleteOneByGovernment(government.trim(), token);

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
                    <DialogTitle>Удалить один объект по типу правления</DialogTitle>
                    <DialogDescription>
                        Введите тип правления. Будет удалён один объект, соответствующий указанному типу.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="government">Тип правления</Label>
                        <Input
                            id="government"
                            value={government}
                            onChange={(e) => setGovernment(e.target.value)}
                            placeholder="Например: PUPPET_STATE"
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

export default DeleteByGovermentModal;
