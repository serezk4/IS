import { BookCreature } from '@/app/utilities/providers/auth-provider/api-layer';
import { SortOrder } from './types';

export const RU_DATE = new Intl.DateTimeFormat('ru-RU', { 
  day: '2-digit', 
  month: '2-digit', 
  year: 'numeric' 
});

export const RU_DATE_TIME = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

export function toEpochMs(v: unknown): number | null {
  if (v == null) return null;
  if (Array.isArray(v) && v.length >= 3 && v.every(n => Number.isFinite(n))) {
    const [y, m, d] = v as number[];
    return Date.UTC(Number(y), Number(m) - 1, Number(d));
  }
  if (typeof v === 'number') {
    if (v > 0 && v < 10000) return Date.UTC(Math.trunc(v), 0, 1);
    const asInt = Math.trunc(v);
    if (asInt >= 1_000_000_000 && asInt < 10_000_000_000) return Math.round(v * 1000);
    if (asInt >= 1_000_000_000_000) return asInt;
    if (asInt >= 1000 && asInt < 10000) return Date.UTC(asInt, 0, 1);
    return null;
  }
  if (typeof v === 'string') {
    const t = Date.parse(v);
    return Number.isNaN(t) ? null : t;
  }
  return null;
}

export function formatDateReadable(v: unknown): string {
  const ms = toEpochMs(v);
  if (ms == null) return '—';
  const hasTime = (typeof v === 'number' && Math.trunc(v) >= 1_000_000_000) || (typeof v === 'string' && v.includes('T'));
  const dt = new Date(ms);
  return hasTime ? RU_DATE_TIME.format(dt) : RU_DATE.format(dt);
}

export function getFieldValue(c: BookCreature, key: string) {
  switch (key) {
    case 'id':
      return c.id ?? 0;
    case 'ownerEmail':
      return c.ownerEmail ?? '';
    case 'name':
      return c.name ?? '';
    case 'age':
      return c.age ?? 0;
    case 'creatureType':
      return c.creatureType ?? '';
    case 'creationDate':
      return toEpochMs(c.creationDate) ?? 0;
    case 'attackLevel':
      return c.attackLevel ?? 0;
    case 'defenseLevel':
      return c.defenseLevel ?? 0;
    default:
      return (c as Record<string, unknown>)[key] ?? '';
  }
}

export function compareItems(a: BookCreature, b: BookCreature, sortKey: string, order: SortOrder) {
  const va = getFieldValue(a, sortKey);
  const vb = getFieldValue(b, sortKey);
  let r = 0;
  if (typeof va === 'number' && typeof vb === 'number') r = va - vb;
  else r = String(va).localeCompare(String(vb));
  if (r === 0) r = (a.id ?? 0) - (b.id ?? 0);
  return order === 'asc' ? r : -r;
}
