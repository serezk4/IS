
export const APP_CONFIG = {
  name: 'Book Creatures Manager',
  version: '1.0.0',
  description: 'Система управления книжными существами',
} as const;

export const PAGINATION_OPTIONS = [10, 20, 50, 100] as const;

export const CREATURE_TYPES = [
  { value: 'HUMAN', label: 'Человек' },
  { value: 'ELF', label: 'Эльф' },
  { value: 'HOBBIT', label: 'Хоббит' },
] as const;

export const COORDINATES_LIMITS = {
  x: { min: 0, max: 109 },
  y: { min: -Infinity, max: Infinity },
} as const;

export const VALIDATION_RULES = {
  name: { maxLength: 200 },
  email: { maxLength: 255 },
  password: { minLength: 8 },
  coordinates: { x: { min: 0, max: 109 } },
  attackLevel: { min: 1 },
  defenseLevel: { min: 0.01 },
  area: { min: 0.01 },
  population: { min: 1 },
  populationDensity: { min: 0.01 },
  ringWeight: { min: 0.01 },
} as const;

export const STORAGE_KEYS = {
  smartColumns: 'smartColumns',
  tableFullWidth: 'tableFullWidth',
  tableVisibleColumns: 'tableVisibleColumns',
  tableColWidths: 'tableColWidths',
  userPreferences: 'userPreferences',
} as const;
