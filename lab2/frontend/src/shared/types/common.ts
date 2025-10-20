
export interface Coordinates {
  x: number;
  y: number;
}

export interface Governor {
  birthday?: string;
}

export interface CreatureLocation {
  name: string;
  area: number;
  population: number;
  establishmentDate: string | null;
  governor: Governor | null;
  isCapital: boolean | null;
  populationDensity: number;
}

export interface Ring {
  name: string;
  weight: number | null;
}

export interface BaseEntity {
  id: number;
  creationDate: string;
}

export interface ApiResponse<T = unknown> {
  ok: boolean;
  status?: number;
  errorCode?: string;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  order: SortOrder;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: number;
  minWidth?: number;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'date' | 'datetime-local' | 'checkbox' | 'select';
  required?: boolean;
  placeholder?: string;
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  options?: Array<{ value: string; label: string }>;
}
