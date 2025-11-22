
export interface BookCreature {
  id: number;
  ownerEmail: string;
  ownerSub: string;
  name: string | null;
  coordinates: { x: number; y: number };
  age: number | null;
  creatureType: string;
  creatureLocation: {
    name: string;
    area: number;
    population: number;
    establishmentDate: string | null;
    governor: { birthday: string } | null;
    isCapital: boolean | null;
    populationDensity: number;
  };
  creationDate: string;
  attackLevel: number;
  defenseLevel: number;
  ring: { name: string; weight: number | null };
  isYours: boolean;
}

export interface BookCreaturesResponse {
  content: BookCreature[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ObjectsPerUserStats {
  userEmail: string;
  objectCount: number;
}

export interface ObjectsPerUserStatsResponse {
  stats: ObjectsPerUserStats[];
}

export interface FormattedApiException {
  errorCode?: string;
  message?: string;
}

export interface ApiResponse<T = unknown> {
  ok: boolean;
  status?: number;
  errorCode?: string;
  message?: string;
  data?: T;
}
