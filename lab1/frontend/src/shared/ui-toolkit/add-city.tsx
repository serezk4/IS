'use client';

import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Button, Card, CardContent, CardHeader, CardTitle, Input, Label,} from '@/shared/ui-toolkit';
import {createCity} from '@/app/utilities/providers/auth-provider/api-layer';
import {CityCreatePayload} from '@/app/utilities/providers/auth-provider/types';
import {useTokenRotation} from "@/app/utilities/providers/auth-provider/useTokenRotation";

function toIsoWithZ(value?: string | null): string | undefined {
    if (!value) return undefined;
    const withSeconds = value.length === 16 ? `${value}:00` : value;
    const d = new Date(withSeconds);
    if (Number.isNaN(d.getTime())) return undefined;
    const iso = d.toISOString();
    return iso.replace('.000Z', 'Z');
}

function setFormValue(form: HTMLFormElement, name: string, value: string | number | boolean) {
    const el = form.elements.namedItem(name);
    if (!el) return;
    if (el instanceof HTMLInputElement) {
        if (el.type === 'checkbox') el.checked = Boolean(value);
        else el.value = String(value);
    } else if (el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
        el.value = String(value);
    }
}

export default function AddCityModal() {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Button onClick={() => setOpen(true)}>Добавить объект</Button>
            {open && (
                <Modal onClose={() => setOpen(false)}>
                    <AddCityForm onClose={() => setOpen(false)}/>
                </Modal>
            )}
        </>
    );
}

function Modal({
                   children,
                   onClose,
               }: {
    children: React.ReactNode;
    onClose: () => void;
}) {
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
                        <CardTitle>Новый объект</CardTitle>
                        <Button variant="outline" onClick={onClose}>Закрыть</Button>
                    </CardHeader>
                    <CardContent>{children}</CardContent>
                </Card>
            </div>
        </div>
    );
}

function AddCityForm({
                         onClose,
                     }: {
    onClose: () => void;
}) {
    const formRef = useRef<HTMLFormElement>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {accessToken} = useTokenRotation()

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

    const fillWithTestData = useCallback(() => {
        const f = formRef.current;
        if (!f) return;
        setFormValue(f, 'name', 'Testopolis');
        setFormValue(f, 'population', 12345);
        setFormValue(f, 'timezone', 3);
        setFormValue(f, 'isCapital', true);
        setFormValue(f, 'coordinatesX', 207);
        setFormValue(f, 'coordinatesY', 106);
        setFormValue(f, 'area', 2156);
        setFormValue(f, 'elevation', 3605);
        setFormValue(f, 'climate', 'MEDITERRANIAN');
        setFormValue(f, 'government', 'THALASSOCRACY');
        setFormValue(f, 'governorBirthDate', '1212-12-12');
        setFormValue(f, 'creationDate', '1212-12-12T12:12');
        setFormValue(f, 'foundationDate', '1212-12-12T12:12');
    }, []);

    const onSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setSubmitting(true);
            setError(null);

            const fd = new FormData(e.currentTarget);

            const payload: CityCreatePayload = {
                name: String(fd.get('name') || '').trim(),
                population: Number(fd.get('population') || 0),
                timezone: Number(fd.get('timezone') ?? 0),
                capital: fd.get('isCapital') === 'on',
                coordinates: {
                    x: Number(fd.get('coordinatesX') || 0),
                    y: Number(fd.get('coordinatesY') || 0),
                },
                area: Number(fd.get('area') || 0),
                metersAboveSeaLevel: Number(fd.get('elevation')),
                climate: (fd.get('climate') as any) || undefined,
                government: (fd.get('government') as any) || undefined,
                governor: {
                    birthday: fd.get('governorBirthDate') as string || null,
                },
                establishmentDate: toIsoWithZ(fd.get('foundationDate') as string),
            };

            try {
                const res = await createCity(accessToken, payload);
                if (res?.status != 201) throw new Error(`Ошибка сохранения: ${res?.data.message}`);
                if (formRef.current) formRef.current.reset();
                onClose();
            } catch (err: any) {
                setError(err?.message ?? 'Ошибка сохранения');
            } finally {
                setSubmitting(false);
            }
        },
        [accessToken, onClose]
    );

    return (
        <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="name">Название *</Label>
                    <Input id="name" name="name" placeholder="Например, Testopolis" required/>
                    <p className="text-xs text-muted-foreground">текст</p>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="population">Население *</Label>
                    <Input id="population" name="population" type="number" min={0} step={1} required/>
                    <p className="text-xs text-muted-foreground">в людях (чел.)</p>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="timezone">Часовой пояс *</Label>
                    <select
                        id="timezone"
                        name="timezone"
                        defaultValue="3"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                        <option value="" disabled>Выберите часовой пояс</option>
                        {timezones.map((tz) => (
                            <option key={tz.value} value={tz.value}>{tz.label}</option>
                        ))}
                    </select>
                    <p className="text-xs text-muted-foreground">формат строки, например “UTC+3 (MSK)”</p>
                </div>

                <div className="flex items-center gap-3">
                    <input id="isCapital" name="isCapital" type="checkbox" className="h-4 w-4"/>
                    <Label htmlFor="isCapital">Столица</Label>
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="coordinatesX">Коорд. X *</Label>
                    <Input id="coordinatesX" name="coordinatesX" type="number" step="1" required/>
                    <p className="text-xs text-muted-foreground">в условных единицах (координаты), целое</p>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="coordinatesY">Коорд. Y *</Label>
                    <Input id="coordinatesY" name="coordinatesY" type="number" step="1" required/>
                    <p className="text-xs text-muted-foreground">в условных единицах (координаты), целое</p>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="area">Площадь *</Label>
                    <Input id="area" name="area" type="number" step="1" min={0} required/>
                    <p className="text-xs text-muted-foreground">в квадратных километрах (км²)</p>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="elevation">Высота</Label>
                    <Input id="elevation" name="elevation" type="number" step="1"/>
                    <p className="text-xs text-muted-foreground">в метрах над уровнем моря (м)</p>
                </div>
            </section>

            {/* Блок 3: справочники */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="climate">Климат</Label>
                    <select
                        id="climate"
                        name="climate"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        defaultValue=""
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
                        defaultValue=""
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
                    <Input id="governorBirthDate" name="governorBirthDate" type="date"/>
                    <p className="text-xs text-muted-foreground">дата (YYYY-MM-DD)</p>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="creationDate">Дата создания</Label>
                    <Input id="creationDate" name="creationDate" type="datetime-local"/>
                    <p className="text-xs text-muted-foreground">
                        локальное дата/время, конвертируется в UTC ISO-8601 (YYYY-MM-DDTHH:mm:ssZ)
                    </p>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="foundationDate">Дата основания</Label>
                    <Input id="foundationDate" name="foundationDate" type="datetime-local"/>
                    <p className="text-xs text-muted-foreground">
                        локальное дата/время, конвертируется в UTC ISO-8601 (YYYY-MM-DDTHH:mm:ssZ)
                    </p>
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
                <Button type="button" variant="outline" onClick={fillWithTestData}>
                    Заполнить тестовыми данными
                </Button>
                <Button type="submit" disabled={submitting}>
                    {submitting ? 'Сохранение…' : 'Сохранить'}
                </Button>
            </div>
        </form>
    );
}

export {AddCityModal}
