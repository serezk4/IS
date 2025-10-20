import React from 'react';
import { BookCreature } from '@/app/utilities/providers/auth-provider/api-layer';
import { formatDateReadable } from '../utils';
import { RingCell, CreatureLocationCell, CoordinatesCell } from '../cells';

interface RowHoverCardProps {
  state: {
    x: number;
    y: number;
    row?: BookCreature;
  } | null;
}

export function RowHoverCard({ state }: RowHoverCardProps) {
  if (!state?.row) return null;

  const r = state.row;

  return (
    <div
      className="pointer-events-none fixed z-50 w-[420px] max-w-[90vw] rounded-md border border-border bg-popover p-3 text-sm shadow-md"
      style={{ left: state.x + 12, top: state.y + 12 }}
    >
      <div className="mb-2 text-xs font-semibold text-muted-foreground">Полная информация</div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        <div className="text-muted-foreground">#</div>
        <div>{r.id}</div>
        <div className="text-muted-foreground">владелец</div>
        <div className="truncate">{r.ownerEmail ?? "—"}</div>
        <div className="text-muted-foreground">название</div>
        <div className="font-medium truncate">{r.name ?? "—"}</div>
        <div className="text-muted-foreground">координаты</div>
        <div><CoordinatesCell coords={r.coordinates} /></div>
        <div className="text-muted-foreground">город</div>
        <div><CreatureLocationCell creatureLocation={r.creatureLocation} /></div>
        <div className="text-muted-foreground">дата создания</div>
        <div>{formatDateReadable(r.creationDate)}</div>
        <div className="text-muted-foreground">возраст</div>
        <div>{r.age ?? "—"}</div>
        <div className="text-muted-foreground">тип создания</div>
        <div>{r.creatureType ?? "—"}</div>
        <div className="text-muted-foreground">уровень атаки</div>
        <div>{r.attackLevel}</div>
        <div className="text-muted-foreground">уровень защиты</div>
        <div>{r.defenseLevel}</div>
        <div className="text-muted-foreground">кольцо</div>
        <div><RingCell ring={r.ring} /></div>
      </div>
    </div>
  );
}
