import { AxiosResponse } from 'axios';
import { apiClient } from './client';
import { apiRoutes } from '@/app/routing';
import { BookCreature, BookCreaturesResponse, ObjectsPerUserStatsResponse, FormattedApiException, ApiResponse } from './types';
import { BookCreatureCreatePayload } from '../types';
import { GroupedByCreatureTypeDto } from '@/shared/ui-toolkit/group-by-creature-group';

export const getCities = async (
  token?: string,
  page = 0,
  size = 10,
  sort = 'id,asc',
  opts?: { signal?: AbortSignal }
): Promise<BookCreaturesResponse | undefined> =>
  apiClient
    .get<BookCreaturesResponse>(apiRoutes.objects.fetch, {
      params: { page, size, sort },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      signal: opts?.signal,
    })
    .then((r) => r.data)
    .catch(() => undefined);

export const getCity = async (
  token?: string,
  id?: number,
  opts?: { signal?: AbortSignal }
): Promise<BookCreature | undefined> => {
  if (id == null) return undefined;
  return apiClient
    .get<BookCreature>(`${apiRoutes.objects.fetch}/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      signal: opts?.signal,
    })
    .then((r) => r.data)
    .catch(() => undefined);
};

export const createBookCreature = async (
  token: string | undefined,
  payload: BookCreatureCreatePayload,
  opts?: { signal?: AbortSignal }
): Promise<AxiosResponse | undefined> =>
  apiClient
    .post<BookCreature>(apiRoutes.objects.create, payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      signal: opts?.signal,
    })
    .then((r) => r)
    .catch(() => undefined);

export const updateBookCreature = async (
  token: string | undefined,
  id: number,
  payload: Partial<BookCreatureCreatePayload>,
  opts?: { signal?: AbortSignal }
): Promise<AxiosResponse | undefined> =>
  apiClient
    .patch<BookCreature>(`${apiRoutes.objects.update}/${id}`, payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      signal: opts?.signal,
    })
    .then((r) => r)
    .catch(() => undefined);

export const deleteOneById = async (
  id: number,
  token?: string,
  opts?: { signal?: AbortSignal }
): Promise<ApiResponse | undefined> => {
  try {
    const res = await apiClient.delete(`${apiRoutes.objects.by_id}/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      signal: opts?.signal,
      validateStatus: () => true,
    });

    if (res.status >= 200 && res.status < 300) {
      return { ok: true };
    }

    const data = res.data as FormattedApiException | undefined;
    return { ok: false, status: res.status, ...data };
  } catch {
    return undefined;
  }
};

export const deleteOneByAttackLevel = async (
  attackLevel: number,
  token?: string,
  opts?: { signal?: AbortSignal }
): Promise<ApiResponse | undefined> => {
  try {
    const res = await apiClient.delete(`${apiRoutes.objects.by_attack_level}/${attackLevel}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      signal: opts?.signal,
      validateStatus: () => true,
    });

    if (res.status >= 200 && res.status < 300) {
      return { ok: true };
    }

    const data = res.data as FormattedApiException | undefined;
    return { ok: false, status: res.status, ...data };
  } catch {
    return undefined;
  }
};

export const searchCitiesByName = async (
  name: string,
  token?: string,
  opts?: { signal?: AbortSignal }
): Promise<BookCreature[]> => {
  try {
    const r = await apiClient.get<BookCreature[]>(`/api/v1/objects/search`, {
      params: { name },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      signal: opts?.signal,
    });
    return r.data || [];
  } catch (e: any) {
    if (e?.response?.status === 404) return [];
    throw e;
  }
};

export const getGroupByCreatureType = async (
  token: string,
  opts?: { signal?: AbortSignal }
): Promise<GroupedByCreatureTypeDto[] | undefined> =>
  apiClient
    .get<GroupedByCreatureTypeDto[]>(apiRoutes.objects.group_by_creature_type, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      signal: opts?.signal,
    })
    .then((r) => r.data)
    .catch(() => undefined);

export const getUniqueDefenseLevels = async (
  token: string,
  opts?: { signal?: AbortSignal }
): Promise<number[] | undefined> =>
  apiClient
    .get<number[]>(apiRoutes.objects.unique_defense_levels, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      signal: opts?.signal,
    })
    .then((r) => r.data)
    .catch(() => undefined);

export const objectsPerUserStats = async (
  token?: string,
  opts?: { signal?: AbortSignal }
): Promise<ObjectsPerUserStatsResponse | undefined> =>
  apiClient
    .get<ObjectsPerUserStatsResponse>(apiRoutes.objects.stats_per_user, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      signal: opts?.signal,
    })
    .then((r) => r.data)
    .catch(() => undefined);

export interface ImportCsvResponse {
  importedCount: number;
  failedCount: number;
  errors: string[];
}

export type ImportStatus = 'COMPLETED' | 'PARTIAL' | 'FAILED';

export interface ImportHistoryDto {
  id: number;
  fileName: string;
  fileSize?: number;
  importDate: string;
  importedBy: string;
  importedCount: number;
  status: ImportStatus;
}

export interface ImportHistoryPage {
  content: ImportHistoryDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const importObjectsFromCsv = async (
  file: File,
  token?: string,
  opts?: { signal?: AbortSignal }
): Promise<ImportCsvResponse | undefined> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.post<ImportCsvResponse>(
      apiRoutes.objects.import,
      formData,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: opts?.signal,
        validateStatus: () => true,
      }
    );

    if (res.status >= 200 && res.status < 300) {
      return res.data;
    }

    return undefined;
  } catch {
    return undefined;
  }
};

export const getImportHistory = async (
  token?: string,
  page = 0,
  size = 20,
  sort = 'importDate,desc',
  opts?: { signal?: AbortSignal }
): Promise<ImportHistoryPage | undefined> =>
  apiClient
    .get<ImportHistoryPage>(apiRoutes.objects.import_history, {
      params: { page, size, sort },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      signal: opts?.signal,
    })
    .then((r) => r.data)
    .catch(() => undefined);
