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
            setMessage(res.message || "Кольца перераспределены");
            onSuccess?.();
            setTimeout(() => {
                onOpenChange(false);
            }, 2000);
        } else {
            setMessage(
                `${res?.message || "Операция не выполнена"}${
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

                {message && (
                    <div className={`px-4 py-2 rounded-md text-sm ${
                        message.includes("перераспределены") 
                            ? "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500" 
                            : "bg-destructive/10 text-destructive border border-destructive"
                    }`}>
                        {message}
                    </div>
                )}

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
