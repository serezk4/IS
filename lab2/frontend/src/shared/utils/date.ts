
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

  const hasTime = (typeof v === 'number' && Math.trunc(v) >= 1_000_000_000) || 
                  (typeof v === 'string' && v.includes('T'));
  const dt = new Date(ms);

  return hasTime ? RU_DATE_TIME.format(dt) : RU_DATE.format(dt);
}

export function toIsoWithZ(value?: string | null): string | undefined {
  if (!value) return undefined;
  const withSeconds = value.length === 16 ? `${value}:00` : value;
  const d = new Date(withSeconds);
  if (Number.isNaN(d.getTime())) return undefined;
  const iso = d.toISOString();
  return iso.replace('.000Z', 'Z');
}

export function toLocalInput(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
