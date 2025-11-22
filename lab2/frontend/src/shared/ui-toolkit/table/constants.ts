import { ColumnDef } from './types';

export const columnsDef: ColumnDef[] = [
  { key: 'id', label: '#' },
  { key: 'ownerEmail', label: 'владелец' },
  { key: 'name', label: 'название' },
  { key: 'coordinates', label: 'координаты' },
  { key: 'creationDate', label: 'создан' },
  { key: 'age', label: 'возраст' },
  { key: 'creatureType', label: 'тип' },
  { key: 'creatureLocation', label: 'локация' },
  { key: 'attackLevel', label: 'атака' },
  { key: 'defenseLevel', label: 'защита' },
  { key: 'ring', label: 'кольцо' }
] as const;

export const ALL_TRUE = columnsDef.reduce((a, c) => ({ ...a, [c.key]: true }), {} as Record<string, boolean>);

export const COL_MIN = 60;

export const PRESETS = {
  all: { ...ALL_TRUE },
  minimum: makePreset(['id', 'ownerEmail', 'name', 'creatureType']),
  geo: makePreset(['name', 'coordinates', 'ownerEmail', 'age', 'creatureType', 'ring']),
  info: makePreset(['name', 'coordinates', 'ownerEmail', 'age', 'creatureType', 'ring', 'creatureLocation']),
  stats: makePreset(['name', 'attackLevel', 'defenseLevel']),
} as const;

export type PresetName = keyof typeof PRESETS;

function makePreset(keys: string[]): Record<string, boolean> {
  const set = new Set(keys);
  return Object.fromEntries(columnsDef.map(c => [c.key, set.has(c.key)]));
}
