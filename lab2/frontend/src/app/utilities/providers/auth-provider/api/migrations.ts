import { apiClient } from './client';
import { apiRoutes } from '@/app/routing';
import { FormattedApiException } from './types';

export async function migratePopulation(
  fromId: number, 
  toId: number, 
  token?: string, 
  opts?: { signal?: AbortSignal }
) {
  try {
    await apiClient.post(
      `${apiRoutes.objects.migrate_base}/${fromId}/migrate/${toId}`,
      undefined,
      { headers: token ? { Authorization: `Bearer ${token}` } : undefined, signal: opts?.signal }
    );
    return { ok: true as const };
  } catch (e: unknown) {
    const data = e?.response?.data as FormattedApiException | undefined;
    return { ok: false as const, status: e?.response?.status, ...data };
  }
}

export async function migrateHalfFromCapital(
  token?: string,
  opts?: { signal?: AbortSignal }
) {
  const res = await apiClient.post(
    apiRoutes.objects.migrate_half,
    null,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      signal: opts?.signal,
      validateStatus: () => true,
    }
  );

  if (res.status >= 200 && res.status < 300) {
    return 'Население переселено';
  }

  const data = res.data as FormattedApiException | undefined;
  return data?.message ?? `Ошибка ${res.status}`;
}

export async function createTestObjects(
  token?: string,
  opts?: { signal?: AbortSignal }
) {
  const res = await apiClient.post(
    `${apiRoutes.objects.test}`,
    null,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      signal: opts?.signal,
      validateStatus: () => true,
    }
  );

  if (res.status >= 200 && res.status < 300) {
    return 'Тестовые объекты созданы';
  }

  const data = res.data as FormattedApiException | undefined;
  return data?.message ?? `Ошибка ${res.status}`;
}

export const distributeRings = async (
  token?: string,
  opts?: { signal?: AbortSignal }
): Promise<{ ok: boolean; status?: number; errorCode?: string; message?: string } | undefined> => {
  try {
    const res = await apiClient.post(
      `${apiRoutes.objects.distribute_rings}`,
      null,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        signal: opts?.signal,
        validateStatus: () => true,
      }
    );

    if (res.status >= 200 && res.status < 300) {
      return { ok: true };
    }

    const data = res.data as FormattedApiException | undefined;
    return { ok: false, status: res.status, ...data };
  } catch {
    return undefined;
  }
};
