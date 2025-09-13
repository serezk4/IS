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
import {migrateHalfFromCapital} from "@/app/utilities/providers/auth-provider/api-layer";
import {useTokenRotation} from "@/app/utilities/providers/auth-provider/useTokenRotation";

export function MigratePopulationHalf({
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
        const token = await accessToken
        const res = await migrateHalfFromCapital(token);
        setPending(false);
        setMessage(res ? res : "иди нахуй");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Переселить со столицы 50% населения</DialogTitle>
                    <DialogDescription>
                        И распределить их в 3 города с минимальным количеством жителей
                    </DialogDescription>
                    {message && (
                        <div className="rounded border p-2 text-sm">
                            {message}
                        </div>
                    )}
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
                        {pending ? "Выполняется..." : `Переселить`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
