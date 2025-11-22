export type SortOrder = 'asc' | 'desc';

export type ColKey = 'id' | 'ownerEmail' | 'name' | 'coordinates' | 'creationDate' | 'age' | 'creatureType' | 'creatureLocation' | 'attackLevel' | 'defenseLevel' | 'ring';

export interface ColumnDef {
  key: ColKey;
  label: string;
}

export interface TableState {
  sortField: string;
  sortOrder: SortOrder;
  pageIndex: number;
  size: number;
  totalElements: number;
  totalPages: number;
  visibleColumns: Record<string, boolean>;
  colWidths: Record<string, number>;
  hiddenIds: Set<number>;
  showHidden: boolean;
  hoverCardEnabled: boolean;
  fullWidth: boolean;
  smartColumns: boolean;
}

export interface HoverState {
  x: number;
  y: number;
  row?: any;
}

export interface TableProps {
  fullWidth?: boolean;
  smartColumns?: boolean;
}
