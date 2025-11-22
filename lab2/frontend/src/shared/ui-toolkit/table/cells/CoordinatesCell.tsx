import React from 'react';
import { Copy } from 'lucide-react';
import * as RTooltip from '@radix-ui/react-tooltip';

interface CoordinatesCellProps {
  coords?: {
    x: number;
    y: number;
  };
}

export function CoordinatesCell({ coords }: CoordinatesCellProps) {
  if (!coords) return <span className="text-muted-foreground">—</span>;

  const x = coords.x;
  const y = coords.y;
  const text = `x=${x}, y=${y}`;

  const copy = () => navigator.clipboard?.writeText(text).catch(() => {});
  const fmt = (v: number) => Number(v).toLocaleString();

  return (
    <div className="inline-flex items-center gap-2 max-w-full">
      <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[12px] font-mono max-w-full">
        <span className="shrink-0">x:</span>
        <span className="tabular-nums truncate">{fmt(x)}</span>
        <span className="shrink-0">y:</span>
        <span className="tabular-nums truncate">{fmt(y)}</span>
      </span>
      <RTooltip.Root>
        <RTooltip.Trigger asChild>
          <button 
            onClick={copy} 
            className="rounded p-1 hover:bg-muted" 
            aria-label="Скопировать координаты"
          >
            <Copy className="h-3.5 w-3.5 opacity-70" />
          </button>
        </RTooltip.Trigger>
        <RTooltip.Content 
          className="rounded-md border border-border bg-popover px-2 py-1 text-xs shadow-sm"
          sideOffset={6}
        >
          Скопировать
        </RTooltip.Content>
      </RTooltip.Root>
    </div>
  );
}
