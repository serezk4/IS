'use client';

import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Button, Card, CardContent, CardHeader, CardTitle, Input, Label} from '@/shared/ui-toolkit';
import {City, updateCity} from '@/app/utilities/providers/auth-provider/api-layer';
import {useTokenRotation} from "@/app/utilities/providers/auth-provider/useTokenRotation";

function toIsoWithZ(value?: string | null): string | undefined {
    if (!value) return undefined;
    const withSeconds = value.length === 16 ? `${value}:00` : value;
    const d = new Date(withSeconds);
    if (Number.isNaN(d.getTime())) return undefined;
    const iso = d.toISOString();
    return iso.replace('.000Z', 'Z');
}

export default function EditCityModal({
                                          city,
                                          open,
                                          onClose,
                                      }: { city: City; open: boolean; onClose: () => void }) {
    if (!open) return null;
    return (
        <Modal onClose={onClose}>
            <EditCityForm city={city} onClose={onClose}/>
        </Modal>
    );
}

function Modal({children, onClose}: { children: React.ReactNode; onClose: () => void; }) {
    const onBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };
    return (
        <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto bg-black/50"
            onClick={onBackdrop}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
        >
            <div className="m-4 w-full max-w-3xl">
                <Card className="border border-border bg-background shadow-xl">
                    <CardHeader className="flex-row items-center justify-between">
                        <CardTitle>Изменение объекта</CardTitle>
                        <Button variant="outline" onClick={onClose}>Закрыть</Button>
                    </CardHeader>
                    <CardContent>{children}</CardContent>
                </Card>
            </div>
        </div>
    );
}

function EditCityForm({city, onClose}: { city: City; onClose: () => void; }) {
    const formRef = useRef<HTMLFormElement>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {accessToken} = useTokenRotation();

    const timezones = useMemo(
        () => [
            {label: 'UTC−12', value: -12},
            {label: 'UTC−11', value: -11},
            {label: 'UTC−10', value: -10},
            {label: 'UTC−9', value: -9},
            {label: 'UTC−8 (PST)', value: -8},
            {label: 'UTC−7 (MST)', value: -7},
            {label: 'UTC−6 (CST)', value: -6},
            {label: 'UTC−5 (EST)', value: -5},
            {label: 'UTC−4', value: -4},
            {label: 'UTC−3', value: -3},
            {label: 'UTC−2', value: -2},
            {label: 'UTC−1', value: -1},
            {label: 'UTC±0 (UTC)', value: 0},
            {label: 'UTC+1', value: 1},
            {label: 'UTC+2', value: 2},
            {label: 'UTC+3 (MSK)', value: 3},
            {label: 'UTC+4', value: 4},
            {label: 'UTC+5', value: 5},
            {label: 'UTC+6', value: 6},
            {label: 'UTC+7', value: 7},
            {label: 'UTC+8', value: 8},
            {label: 'UTC+9', value: 9},
            {label: 'UTC+10', value: 10},
            {label: 'UTC+11', value: 11},
            {label: 'UTC+12', value: 12},
        ],
        []
    );

    const toLocalInput = (iso?: string | null) => {
        if (!iso) return '';
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return '';
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const onSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setSubmitting(true);
            setError(null);

            const fd = new FormData(e.currentTarget);

            const payload = {
                name: String(fd.get('name') || '').trim(),
                population: Number(fd.get('population') || 0),
                timezone: Number(fd.get('timezone') ?? 0),
                capital: fd.get('isCapital') === 'on',
                coordinates: {
                    x: Number(fd.get('coordinatesX') || 0),
                    y: Number(fd.get('coordinatesY') || 0),
                },
                area: Number(fd.get('area') || 0),
                metersAboveSeaLevel: fd.get('elevation') ? Number(fd.get('elevation')) : undefined,
                climate: (fd.get('climate') as any) || undefined,
                government: (fd.get('government') as any) || undefined,
                governor: {
                    birthday: (fd.get('governorBirthDate') as string) || null,
                },
                establishmentDate: toIsoWithZ(fd.get('foundationDate') as string),
            };

            try {
                const res = await updateCity(accessToken, city.id, payload as any);
                if (res?.status && res.status !== 200) throw new Error(`Ошибка изменения: ${res?.data?.message}`);
                onClose();
            } catch (err: any) {
                setError(err?.message ?? 'Ошибка изменения');
            } finally {
                setSubmitting(false);
            }
        },
        [accessToken, city.id, onClose]
    );

    return (
        <form ref={formRef} onSubmit={onSubmit} className="space-y-6" key={city.id}>
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="name">Название *</Label>
                    <Input id="name" name="name" defaultValue={city.name} required/>
                    <p className="text-xs text-muted-foreground">текст</p>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="population">Население *</Label>
                    <Input id="population" name="population" type="number" min={0} step={1}
                           defaultValue={city.population} required/>
                    <p className="text-xs text-muted-foreground">в людях (чел.)</p>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="timezone">Часовой пояс *</Label>
                    <select
                        id="timezone"
                        name="timezone"
                        defaultValue={String((city as any).timezone ?? 0)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                        <option value="" disabled>Выберите часовой пояс</option>
                        {timezones.map((tz) => (
                            <option key={tz.value} value={tz.value}>{tz.label}</option>
                        ))}
                    </select>
                    <p className="text-xs text-muted-foreground">смещение от UTC в часах (целое)</p>
                </div>

                <div className="flex items-center gap-3">
                    <input id="isCapital" name="isCapital" type="checkbox" className="h-4 w-4"
                           defaultChecked={city.capital}/>
                    <Label htmlFor="isCapital">Столица</Label>
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="coordinatesX">Коорд. X *</Label>
                    <Input id="coordinatesX" name="coordinatesX" type="number" step="1"
                           defaultValue={city.coordinates?.x ?? ''} required/>
                    <p className="text-xs text-muted-foreground">в условных единицах, целое</p>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="coordinatesY">Коорд. Y *</Label>
                    <Input id="coordinatesY" name="coordinatesY" type="number" step="1"
                           defaultValue={city.coordinates?.y ?? ''} required/>
                    <p className="text-xs text-muted-foreground">в условных единицах, целое</p>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="area">Площадь *</Label>
                    <Input id="area" name="area" type="number" step="1" min={0} defaultValue={city.area} required/>
                    <p className="text-xs text-muted-foreground">в квадратных километрах (км²)</p>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="elevation">Высота</Label>
                    <Input id="elevation" name="elevation" type="number" step="1"
                           defaultValue={city.metersAboveSeaLevel ?? ''}/>
                    <p className="text-xs text-muted-foreground">в метрах над уровнем моря (м)</p>
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="climate">Климат</Label>
                    <select
                        id="climate"
                        name="climate"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        defaultValue={(city as any).climate || ''}
                    >
                        <option value="" disabled>Выберите климат</option>
                        <option value="TROPICAL_SAVANNA">TROPICAL_SAVANNA</option>
                        <option value="HUMID_SUBTROPICAL">HUMID_SUBTROPICAL</option>
                        <option value="OCEANIC">OCEANIC</option>
                        <option value="MEDITERRANIAN">MEDITERRANIAN</option>
                        <option value="SUBARCTIC">SUBARCTIC</option>
                        <option value="TUNDRA">TUNDRA</option>
                    </select>
                    <p className="text-xs text-muted-foreground">значение из списка</p>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="government">Правление</Label>
                    <select
                        id="government"
                        name="government"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        defaultValue={(city as any).government || ''}
                    >
                        <option value="" disabled>Выберите тип правления</option>
                        <option value="DEMOCRACY">DEMOCRACY</option>
                        <option value="MONARCHY">MONARCHY</option>
                        <option value="THALASSOCRACY">THALASSOCRACY</option>
                        <option value="REPUBLIC">REPUBLIC</option>
                        <option value="TECHNOCRACY">TECHNOCRACY</option>
                    </select>
                    <p className="text-xs text-muted-foreground">значение из списка</p>
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="governorBirthDate">ДР губернатора</Label>
                    <Input
                        id="governorBirthDate"
                        name="governorBirthDate"
                        type="date"
                        defaultValue={(city as any).governor?.birthday || (city as any).governorBirthDate || ''}
                    />
                    <p className="text-xs text-muted-foreground">дата (YYYY-MM-DD)</p>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="creationDate">Дата создания</Label>
                    <Input
                        id="creationDate"
                        name="creationDate"
                        type="datetime-local"
                        defaultValue={toLocalInput((city as any).creationDate)}
                    />
                    <p className="text-xs text-muted-foreground">локальное дата/время, не отправляется</p>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="foundationDate">Дата основания</Label>
                    <Input
                        id="foundationDate"
                        name="foundationDate"
                        type="datetime-local"
                        defaultValue={toLocalInput((city as any).establishmentDate)}
                    />
                    <p className="text-xs text-muted-foreground">конвертируется в UTC ISO-8601
                        (YYYY-MM-DDTHH:mm:ssZ)</p>
                </div>
            </section>

            {error && (
                <div
                    className="rounded-md border border-destructive bg-destructive/10 text-destructive px-4 py-2 text-sm">
                    {error}
                </div>
            )}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={onClose}>
                    Отмена
                </Button>
                <Button type="submit" disabled={submitting}>
                    {submitting ? 'Изменение…' : 'Изменить'}
                </Button>
            </div>
        </form>
    );
}

export {EditCityModal}
