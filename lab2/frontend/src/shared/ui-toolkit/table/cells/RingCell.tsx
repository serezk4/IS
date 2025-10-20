import React from 'react';

interface RingCellProps {
  ring?: {
    name?: string;
    weight?: number | null;
  };
}

export function RingCell({ ring }: RingCellProps) {
  if (!ring) return <span className="text-muted-foreground">—</span>;

  const name = ring.name ?? '—';
  const weight = ring.weight != null ? Number(ring.weight).toLocaleString() : '—';

  return (
    <div className="inline-flex items-center gap-2 max-w-full">
      <div className="space-y-1 text-sm">
        <span className="inline-flex flex-col gap-1 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[12px] font-mono max-w-full">
          <div>
            <span className="shrink-0 font-medium">Название:</span>
            <span className="tabular-nums truncate">{name}</span>
          </div>
          <div>
            <span className="shrink-0 font-medium">Вес:</span>
            <span className="tabular-nums truncate">{weight} г.</span>
          </div>
        </span>
      </div>
    </div>
  );
}
