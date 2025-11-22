import React from 'react';
import { formatDateReadable } from '../utils';

interface CreatureLocationCellProps {
  creatureLocation?: {
    name?: string;
    area?: number;
    population?: number;
    establishmentDate?: string | null;
    governor?: { birthday?: string } | null;
    isCapital?: boolean | null;
    populationDensity?: number;
  };
}

export function CreatureLocationCell({ creatureLocation }: CreatureLocationCellProps) {
  if (!creatureLocation) return <span className="text-muted-foreground">—</span>;

  const name = creatureLocation.name ?? '—';
  const area = creatureLocation.area != null ? Number(creatureLocation.area).toLocaleString() : '—';
  const population = creatureLocation.population != null ? Number(creatureLocation.population).toLocaleString() : '—';
  const estDate = formatDateReadable(creatureLocation.establishmentDate);
  const governor = creatureLocation.governor?.birthday ? formatDateReadable(creatureLocation.governor.birthday) : '—';
  const isCapital = creatureLocation.isCapital == null ? '—' : (creatureLocation.isCapital ? 'Yes' : 'No');
  const popDensity = creatureLocation.populationDensity != null ? Number(creatureLocation.populationDensity).toLocaleString() : '—';

  return (
    <div className="inline-flex items-center gap-2 max-w-full">
      <div className="space-y-1 text-sm">
        <span className="inline-flex flex-col gap-1 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[12px] font-mono max-w-full">
          <div>
            <span className="shrink-0 font-medium">Название </span>
            <span className="tabular-nums truncate">{name}</span>
          </div>
          <div>
            <span className="shrink-0 font-medium">Площадь </span>
            <span className="tabular-nums truncate">{area}</span>
          </div>
          <div>
            <span className="shrink-0 font-medium">Население </span>
            <span className="tabular-nums truncate">{population}</span>
          </div>
          <div>
            <span className="shrink-0 font-medium">Дата основания </span>
            <span className="tabular-nums truncate">{estDate}</span>
          </div>
          <div>
            <span className="shrink-0 font-medium">Губернатор </span>
            <span className="tabular-nums truncate">{governor}</span>
          </div>
          <div>
            <span className="shrink-0 font-medium">Столица </span>
            <span className="tabular-nums truncate">{isCapital}</span>
          </div>
          <div>
            <span className="shrink-0 font-medium">Плотность населения </span>
            <span className="tabular-nums truncate">{popDensity}</span>
          </div>
        </span>
      </div>
    </div>
  );
}
