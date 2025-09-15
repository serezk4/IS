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
import {BookCreature, migratePopulation,} from "@/app/utilities/providers/auth-provider/api-layer";
import {useTokenRotation} from "@/app/utilities/providers/auth-provider/useTokenRotation";
import CitySearchSelect from "@/shared/ui-toolkit/city-search-select";

export function MigratePopulationSearchDialog({
                                                  open,
                                                  onOpenChange,
                                                  onSuccess,
                                              }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onSuccess?: () => void;
}) {
    const {accessToken} = useTokenRotation();
    const [fromCity, setFromCity] = useState<BookCreature>();
    const [toCity, setToCity] = useState<BookCreature>();
    const [pending, setPending] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const canSubmit = true

    const run = async () => {
        if (!fromCity || !toCity) {
            setMessage("Выберите оба города");
            return;
        }

        if (fromCity.id === toCity.id) {
            setMessage("Города должны быть разными");
            return;
        }

        setPending(true);
        setMessage(null);
        const token = await accessToken
        console.log(fromCity, toCity, token)
        const res = await migratePopulation(fromCity!.id, toCity!.id, token);
        setPending(false);

        if (res.ok) {
            setMessage("Население переселено");
            onSuccess?.();
            onOpenChange(false);
        } else {
            setMessage(
                `${res.message || "Ошибка миграции"}${
                    res.errorCode ? ` (код: ${res.errorCode})` : ""
                }`
            );
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Переселить всё население</DialogTitle>
                    <DialogDescription>
                        Выберите id города-источника и города-назначения.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <CitySearchSelect
                        label="Город-источник"
                        onSelect={setFromCity}
                    />
                    <CitySearchSelect
                        label="Город-назначения"
                        excludeId={fromCity?.id}
                        onSelect={setToCity}
                    />

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
                        {pending ? "Выполняется..." : `Переселить ${fromCity?.population || 0} человек`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
