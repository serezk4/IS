'use client';

import {useEffect, useRef, useState} from "react";
import {Input, Label} from "@/shared/ui-toolkit";
import {BookCreature, getCity} from "@/app/utilities/providers/auth-provider/api-layer";
import {useTokenRotation} from "@/app/utilities/providers/auth-provider/useTokenRotation";
import {useAuthContext} from "@/app/utilities";

export function CitySearchSelect({
                                     label,
                                     placeholder = "Введите id…",
                                     excludeId,
                                     minChars = 2,
                                     onSelect
                                 }: {
    label: string;
    placeholder?: string;
    excludeId?: number;
    minChars?: number;
    onSelect: (city: BookCreature | undefined) => void;
}) {
    const {accessToken} = useTokenRotation();
    const [q, setQ] = useState("");
    const [items, setItems] = useState<BookCreature[]>([]);
    const [loading, setLoading] = useState(false);
    const abortRef = useRef<AbortController | null>(null);
    const debounceRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        window.clearTimeout(debounceRef.current);
        if (q.trim().length < minChars) {
            setItems([]);
            return;
        }

        debounceRef.current = window.setTimeout(async () => {
            abortRef.current?.abort();
            const ctrl = new AbortController();
            abortRef.current = ctrl;
            setLoading(true);
            const token = await accessToken
            const val = await getCity(token, Number(q.trim()));
            setItems(val ? [val] : []);
            onSelect(val);
            setLoading(false);
        }, 250);

        return () => {
            window.clearTimeout(debounceRef.current);
            abortRef.current?.abort();
        };
    }, [q, excludeId, accessToken, minChars]);

    const {user} = useAuthContext()

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder={placeholder}/>
            <div className="max-h-56 overflow-auto rounded border">
                {loading ? (
                    <div className="p-3 text-sm opacity-70">Загрузка…</div>
                ) : items.length === 0 ? (
                    <div className="p-3 text-sm opacity-70">Нет результатов</div>
                ) : (
                    <ul className="divide-y">
                        {items.map(c => (
                            <li key={c.id}>
                                <div
                                    className={[
                                        "w-full text-left px-3 py-2",
                                        c.ownerSub === user?.sub ? "bg-green-700" : "bg-red-700"
                                    ].join(" ")}
                                    onClick={() => onSelect(c)}
                                >
                                    {c.name} <span className="opacity-60">— id {c.id} население {c.population}</span>
                                    {c.ownerSub == user?.sub
                                        ? <span className="ml-2 italic opacity-70">(Ваш)</span>
                                        : <span className="ml-2 italic opacity-70">(Чужой)</span>}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default CitySearchSelect;