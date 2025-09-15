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
import {distributeRings} from "@/app/utilities/providers/auth-provider/api-layer";

export function DistributeRings({
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

    const canSubmit = true

    const run = async () => {
        setPending(true);
        setMessage(null);

        const token = await accessToken;
        const res = await distributeRings(token);

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
                    <DialogTitle>Перераспределить кольца</DialogTitle>
                    <DialogDescription>
                        Кольца будут перераспределены между всеми вашими объектами
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button
                        variant="secondary"
                        onClick={() => onOpenChange(false)}
                        disabled={pending}
                    >
                        Отмена
                    </Button>
                    <Button onClick={run} disabled={!canSubmit}>
                        {pending ? "Выполняется..." : "Перераспределить"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default DistributeRings;
