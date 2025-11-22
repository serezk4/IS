'use client';

import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Button, Card, CardContent, CardHeader, CardTitle, Input, Label} from '@/shared/ui-toolkit';
import {BookCreature, updateBookCreature} from '@/app/utilities/providers/auth-provider/api-layer';
import {useTokenRotation} from "@/app/utilities/providers/auth-provider/useTokenRotation";

function toIsoWithZ(value?: string | null): string | undefined {
    if (!value) return undefined;
    const withSeconds = value.length === 16 ? `${value}:00` : value;
    const d = new Date(withSeconds);
    if (Number.isNaN(d.getTime())) return undefined;
    const iso = d.toISOString();
    return iso.replace('.000Z', 'Z');
}

function requireStrictPositive(e: React.FormEvent<HTMLInputElement>) {
    const el = e.currentTarget;
    const v = Number(el.value);
    if (!Number.isFinite(v) || v <= 0) el.setCustomValidity('Значение должно быть строго > 0');
    else el.setCustomValidity('');
}

export default function EditCityModal({
                                          city,
                                          open,
                                          onClose,
                                      }: {
    city: BookCreature;
    open: boolean;
    onClose: () => void;
}) {
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

function EditCityForm({city, onClose}: { city: BookCreature; onClose: () => void; }) {
    const formRef = useRef<HTMLFormElement>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {accessToken} = useTokenRotation();
    const [hasRing, setHasRing] = useState<boolean>(Boolean((city as any).ring));

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
            const strOrNull = (k: string) => {
                const v = String(fd.get(k) ?? '').trim();
                return v === '' ? null : v;
            };
            const numOrNull = (k: string) => {
                const v = String(fd.get(k) ?? '').trim();
                return v === '' ? null : Number(v);
            };
            const boolOrNull = (k: string) => (fd.get(k) ? true : null);

            const ringEnabled = hasRing || !!fd.get('ring.name') || !!fd.get('ring.weight');

            const payload = {
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
                    establishmentDate: toIsoWithZ(strOrNull('cl.establishmentDate') || undefined),
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
                const res = await updateBookCreature(accessToken, (city as any).id, payload as any);
                if (res?.status && res.status !== 200) throw new Error(`Ошибка изменения: ${res?.data?.message}`);
                onClose();
            } catch (err: any) {
                setError(err?.message ?? 'Ошибка изменения');
            } finally {
                setSubmitting(false);
            }
        },
        [accessToken, city, hasRing, onClose]
    );

    return (
        <form ref={formRef} onSubmit={onSubmit} className="space-y-6" key={(city as any).id}>
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="name">Имя существа *</Label>
                    <Input id="name" name="name" defaultValue={(city as any).name ?? ''} required maxLength={200}/>
                    <p className="text-xs text-muted-foreground">строка, ≤ 200 символов</p>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="creatureType">Тип существа *</Label>
                    <select
                        id="creatureType"
                        name="creatureType"
                        defaultValue={(city as any).creatureType ?? 'HUMAN'}
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
                    <Input id="age" name="age" type="number" step={1} min={1} defaultValue={(city as any).age ?? ''}/>
                    <p className="text-xs text-muted-foreground">целое ≥ 1 или пусто</p>
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="coordinates.x">Коорд. X *</Label>
                    <Input
                        id="coordinates.x"
                        name="coordinates.x"
                        type="number"
                        step={1}
                        max={109}
                        defaultValue={(city as any).coordinates?.x ?? ''}
                        required
                    />
                    <p className="text-xs text-muted-foreground">целое, ≤ 109</p>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="coordinates.y">Коорд. Y *</Label>
                    <Input
                        id="coordinates.y"
                        name="coordinates.y"
                        type="number"
                        step="0.01"
                        defaultValue={(city as any).coordinates?.y ?? ''}
                        required
                    />
                    <p className="text-xs text-muted-foreground">вещественное число</p>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="attackLevel">Уровень атаки *</Label>
                    <Input
                        id="attackLevel"
                        name="attackLevel"
                        type="number"
                        step={1}
                        min={1}
                        defaultValue={(city as any).attackLevel ?? 1}
                        required
                    />
                    <p className="text-xs text-muted-foreground">целое ≥ 1</p>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="defenseLevel">Уровень защиты *</Label>
                    <Input
                        id="defenseLevel"
                        name="defenseLevel"
                        type="number"
                        step="0.01"
                        min={0}
                        defaultValue={(city as any).defenseLevel ?? 1}
                        onInput={requireStrictPositive}
                        onInvalid={requireStrictPositive}
                        required
                    />
                    <p className="text-xs text-muted-foreground">вещественное, строго &gt; 0</p>
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="cl.name">Локация — Название *</Label>
                    <Input id="cl.name" name="cl.name" defaultValue={(city as any).creatureLocation?.name ?? ''} required maxLength={200}/>
                    <p className="text-xs text-muted-foreground">строка, ≤ 200 символов</p>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="cl.area">Локация — Площадь *</Label>
                    <Input
                        id="cl.area"
                        name="cl.area"
                        type="number"
                        step="0.01"
                        min={0}
                        defaultValue={(city as any).creatureLocation?.area ?? ''}
                        onInput={requireStrictPositive}
                        onInvalid={requireStrictPositive}
                        required
                    />
                    <p className="text-xs text-muted-foreground">вещественное, строго &gt; 0</p>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="cl.population">Локация — Население *</Label>
                    <Input
                        id="cl.population"
                        name="cl.population"
                        type="number"
                        step={1}
                        min={0}
                        defaultValue={(city as any).creatureLocation?.population ?? ''}
                        onInput={requireStrictPositive}
                        onInvalid={requireStrictPositive}
                        required
                    />
                    <p className="text-xs text-muted-foreground">целое, строго &gt; 0</p>
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="cl.populationDensity">Плотность населения *</Label>
                    <Input
                        id="cl.populationDensity"
                        name="cl.populationDensity"
                        type="number"
                        step="0.01"
                        min={0}
                        defaultValue={(city as any).creatureLocation?.populationDensity ?? ''}
                        onInput={requireStrictPositive}
                        onInvalid={requireStrictPositive}
                        required
                    />
                    <p className="text-xs text-muted-foreground">вещественное, строго &gt; 0</p>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="cl.establishmentDate">Локация — Дата основания</Label>
                    <Input
                        id="cl.establishmentDate"
                        name="cl.establishmentDate"
                        type="datetime-local"
                        defaultValue={toLocalInput((city as any).creatureLocation?.establishmentDate)}
                    />
                    <p className="text-xs text-muted-foreground">будет отправлено как ISO-8601 с Z</p>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="cl.governor.birthday">Губернатор — Дата рождения</Label>
                    <Input
                        id="cl.governor.birthday"
                        name="cl.governor.birthday"
                        type="date"
                        defaultValue={(city as any).creatureLocation?.governor?.birthday ?? ''}
                    />
                    <p className="text-xs text-muted-foreground">YYYY-MM-DD</p>
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                    <input
                        id="cl.isCapital"
                        name="cl.isCapital"
                        type="checkbox"
                        className="h-4 w-4"
                        defaultChecked={Boolean((city as any).creatureLocation?.isCapital)}
                    />
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
                        defaultChecked={hasRing}
                        onChange={(e) => setHasRing(e.currentTarget.checked)}
                    />
                </div>
                {hasRing && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="ring.name">Кольцо — Название *</Label>
                            <Input
                                id="ring.name"
                                name="ring.name"
                                defaultValue={(city as any).ring?.name ?? ''}
                                required
                                maxLength={200}
                            />
                            <p className="text-xs text-muted-foreground">строка, ≤ 200 символов</p>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="ring.weight">Кольцо — Вес (г) *</Label>
                            <Input
                                id="ring.weight"
                                name="ring.weight"
                                type="number"
                                step="0.01"
                                min={0}
                                defaultValue={(city as any).ring?.weight ?? ''}
                                onInput={requireStrictPositive}
                                onInvalid={requireStrictPositive}
                                required
                            />
                            <p className="text-xs text-muted-foreground">вещественное, строго &gt; 0</p>
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
                <Button type="submit" disabled={submitting}>
                    {submitting ? 'Изменение…' : 'Изменить'}
                </Button>
            </div>
        </form>
    );
}

export {EditCityModal}