'use client';

import React, {useCallback, useRef, useState} from 'react';
import {Button, Card, CardContent, CardHeader, CardTitle, Input, Label} from '@/shared/ui-toolkit';
import {createBookCreature} from '@/app/utilities/providers/auth-provider/api-layer';
import {BookCreatureCreatePayload} from '@/app/utilities/providers/auth-provider/types';
import {useTokenRotation} from "@/app/utilities/providers/auth-provider/useTokenRotation";

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

function requirePositive(e: React.FormEvent<HTMLInputElement>) {
    const el = e.currentTarget;
    const v = el.valueAsNumber;
    if (Number.isNaN(v) || v <= 0) el.setCustomValidity('Значение должно быть > 0');
    else el.setCustomValidity('');
}

export default function AddCityModal() {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Button onClick={() => setOpen(true)}>Добавить объект</Button>
            {open && (
                <Modal onClose={() => setOpen(false)}>
                    <AddBookCreatureForm onClose={() => setOpen(false)}/>
                </Modal>
            )}
        </>
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
                        <CardTitle>Новый объект</CardTitle>
                        <Button variant="outline" onClick={onClose}>Закрыть</Button>
                    </CardHeader>
                    <CardContent>{children}</CardContent>
                </Card>
            </div>
        </div>
    );
}

function AddBookCreatureForm({onClose}: { onClose: () => void; }) {
    const formRef = useRef<HTMLFormElement>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasRing, setHasRing] = useState(false);
    const {accessToken} = useTokenRotation();

    const fillWithTestData = useCallback(() => {
        const f = formRef.current;
        if (!f) return;
        setFormValue(f, 'name', 'Frodo');
        setFormValue(f, 'creatureType', 'HUMAN');
        setFormValue(f, 'age', 33);
        setFormValue(f, 'coordinates.x', 93);
        setFormValue(f, 'coordinates.y', 25);
        setFormValue(f, 'cl.name', 'Shire');
        setFormValue(f, 'cl.area', 2156.5);
        setFormValue(f, 'cl.population', 12345);
        setFormValue(f, 'cl.populationDensity', 57.26);
        setFormValue(f, 'cl.establishmentDate', '1212-12-12T12:12');
        setFormValue(f, 'cl.governor.birthday', '1212-12-12');
        setFormValue(f, 'cl.isCapital', true);
        setFormValue(f, 'attackLevel', 7);
        setFormValue(f, 'defenseLevel', 1.5);
    }, []);

    const onSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setSubmitting(true);
            setError(null);

            const fd = new FormData(e.currentTarget);
            const numOrNull = (k: string) => {
                const v = String(fd.get(k) ?? '').trim();
                return v === '' ? null : Number(v);
            };
            const strOrNull = (k: string) => {
                const v = String(fd.get(k) ?? '').trim();
                return v === '' ? null : v;
            };
            const boolOrNull = (k: string) => (fd.get(k) ? true : null);
            const ringEnabled = !!fd.get('ring.name') || !!fd.get('ring.weight') || hasRing;

            const payload: BookCreatureCreatePayload = {
                name: String(fd.get('name') || '').trim(),
                coordinates: {
                    x: Number(fd.get('coordinates.x') || 0),
                    y: Number(fd.get('coordinates.y') || 0),
                },
                age: numOrNull('age'),
                creatureType: (fd.get('creatureType') as 'HUMAN' | 'ELF' | 'HOBBIT') ?? 'HUMAN',
                creatureLocation: {
                    name: String(fd.get('cl.name') || '').trim(),
                    area: Number(fd.get('cl.area') || 0),
                    population: Number(fd.get('cl.population') || 0),
                    establishmentDate: strOrNull('cl.establishmentDate'),
                    governor: { birthday: strOrNull('cl.governor.birthday') },
                    isCapital: boolOrNull('cl.isCapital'),
                    populationDensity: Number(fd.get('cl.populationDensity') || 0),
                },
                attackLevel: Number(fd.get('attackLevel') || 0),
                defenseLevel: Number(fd.get('defenseLevel') || 0),
                ring: ringEnabled
                    ? {
                        name: String(fd.get('ring.name') || '').trim(),
                        weight: Number(fd.get('ring.weight') || 0),
                    }
                    : null,
            };

            try {
                const res = await createBookCreature(accessToken, payload);
                if (res?.status != 201) throw new Error(`Ошибка сохранения: ${res?.data?.message ?? 'неизвестная ошибка'}`);
                if (formRef.current) formRef.current.reset();
                setHasRing(false);
                onClose();
            } catch (err: any) {
                setError(err?.message ?? 'Ошибка сохранения');
            } finally {
                setSubmitting(false);
            }
        },
        [accessToken, hasRing, onClose]
    );

    return (
        <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="name">Имя существа *</Label>
                    <Input id="name" name="name" placeholder="Например, Frodo" required maxLength={200}/>
                    <p className="text-xs text-muted-foreground">строка, ≤ 200 символов</p>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="creatureType">Тип существа *</Label>
                    <select
                        id="creatureType"
                        name="creatureType"
                        defaultValue="HUMAN"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                    >
                        <option value="HUMAN">HUMAN</option>
                        <option value="ELF">ELF</option>
                        <option value="HOBBIT">HOBBIT</option>
                    </select>
                    <p className="text-xs text-muted-foreground">одно из: HOBBIT, ELF, HUMAN</p>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="age">Возраст</Label>
                    <Input id="age" name="age" type="number" step={1} min={1} placeholder="например, 33"/>
                    <p className="text-xs text-muted-foreground">целое ≥ 1 или пусто</p>
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="coordinates.x">Коорд. X *</Label>
                    <Input id="coordinates.x" name="coordinates.x" type="number" step={1} max={109} required/>
                    <p className="text-xs text-muted-foreground">целое, ≤ 109</p>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="coordinates.y">Коорд. Y *</Label>
                    <Input id="coordinates.y" name="coordinates.y" type="number" step="0.01" required/>
                    <p className="text-xs text-muted-foreground">вещественное число</p>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="attackLevel">Уровень атаки *</Label>
                    <Input id="attackLevel" name="attackLevel" type="number" step={1} min={1} required/>
                    <p className="text-xs text-muted-foreground">целое ≥ 1</p>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="defenseLevel">Уровень защиты *</Label>
                    <Input id="defenseLevel" name="defenseLevel" type="number" step="0.01" min={0} onInput={requirePositive} onInvalid={requirePositive} required/>
                    <p className="text-xs text-muted-foreground">вещественное, строго > 0</p>
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="cl.name">Локация — Название *</Label>
                    <Input id="cl.name" name="cl.name" placeholder="Например, Shire" required maxLength={200}/>
                    <p className="text-xs text-muted-foreground">строка, ≤ 200 символов</p>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="cl.area">Локация — Площадь *</Label>
                    <Input id="cl.area" name="cl.area" type="number" step="0.01" min={0} onInput={requirePositive} onInvalid={requirePositive} required/>
                    <p className="text-xs text-muted-foreground">вещественное, строго > 0</p>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="cl.population">Локация — Население *</Label>
                    <Input id="cl.population" name="cl.population" type="number" step={1} min={0} onInput={requirePositive} onInvalid={requirePositive} required/>
                    <p className="text-xs text-muted-foreground">целое, строго > 0</p>
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="cl.populationDensity">Плотность населения *</Label>
                    <Input id="cl.populationDensity" name="cl.populationDensity" type="number" step="0.01" min={0} onInput={requirePositive} onInvalid={requirePositive} required/>
                    <p className="text-xs text-muted-foreground">вещественное, строго > 0</p>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="cl.establishmentDate">Локация — Дата основания</Label>
                    <Input id="cl.establishmentDate" name="cl.establishmentDate" type="datetime-local"/>
                    <p className="text-xs text-muted-foreground">дата</p>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="cl.governor.birthday">Губернатор — Дата рождения</Label>
                    <Input id="cl.governor.birthday" name="cl.governor.birthday" type="date"/>
                    <p className="text-xs text-muted-foreground">YYYY-MM-DD</p>
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                    <input id="cl.isCapital" name="cl.isCapital" type="checkbox" className="h-4 w-4"/>
                    <Label htmlFor="cl.isCapital">Столица</Label>
                </div>
            </section>

            <section className="space-y-3">
                <div className="flex items-center gap-3">
                    <input
                        id="hasRing"
                        name="hasRing"
                        type="checkbox"
                        className="h-4 w-4"
                        onChange={(e) => setHasRing(e.currentTarget.checked)}
                    />
                    <Label htmlFor="hasRing">Добавить кольцо</Label>
                </div>
                {hasRing && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="ring.name">Кольцо — Название *</Label>
                            <Input id="ring.name" name="ring.name" placeholder="Например, One Ring" required maxLength={200}/>
                            <p className="text-xs text-muted-foreground">строка, ≤ 200 символов</p>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="ring.weight">Кольцо — Вес (г) *</Label>
                            <Input id="ring.weight" name="ring.weight" type="number" step="0.01" min={0} onInput={requirePositive} onInvalid={requirePositive} required/>
                            <p className="text-xs text-muted-foreground">вещественное, строго > 0</p>
                        </div>
                    </div>
                )}
            </section>

            {error && (
                <div className="rounded-md border border-destructive bg-destructive/10 text-destructive px-4 py-2 text-sm">
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