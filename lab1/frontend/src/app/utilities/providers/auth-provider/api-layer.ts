import axios, {AxiosResponse} from "axios";
import {apiRoutes} from "@/app/routing";
import {
    BookCreatureCreatePayload,
    RefreshResponse,
    SignupRequest,
    UserResponse,
} from "@/app/utilities/providers/auth-provider/types";
import {GroupedByCreatureTypeDto} from "@/shared/ui-toolkit/group-by-creature-group";

type TokenEndpointResponse = {
    access_token: string;
    refresh_token: string;
    access_expiration?: string;
    access_expires_in?: number;
};

export type FormattedApiException = {
    errorCode?: string;
    message?: string;
};

export interface BookCreature {
    id: number;
    ownerEmail: string;
    ownerSub: string;
    name: string | null;
    coordinates: { x: number; y: number };
    age: number | null,
    creatureType: string,
    creatureLocation: {
        name: string,
        area: number,
        population: number,
        establishmentDate: string | null,
        governor: { birthday: string } | null,
        isCapital: boolean | null,
        populationDensity: number
    }
    creationDate: string;
    attackLevel: number;
    defenseLevel: number;
    ring: { name: string; weight: number | null };
    isYours: boolean;
}

interface BookCreaturesResponse {
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

const ax = axios.create({
    withCredentials: true,
    timeout: 15000,
});

const formHeaders = {"Content-Type": "application/x-www-form-urlencoded"};

export const getGroupByCreatureType = async (
    token: string,
    opts?: { signal?: AbortSignal }
): Promise<GroupedByCreatureTypeDto[] | undefined> =>
    ax
        .get<GroupedByCreatureTypeDto[]>(apiRoutes.objects.group_by_creature_type, {
            headers: token ? {Authorization: `Bearer ${token}`} : undefined,
            signal: opts?.signal,
        })
        .then((r) => r.data)
        .catch(() => undefined);

export const getUniqueDefenseLevels = async (
    token: string,
    opts?: { signal?: AbortSignal }
): Promise<number[] | undefined> =>
    ax
        .get<number[]>(apiRoutes.objects.unique_defense_levels, {
            headers: token ? {Authorization: `Bearer ${token}`} : undefined,
            signal: opts?.signal,
        })
        .then((r) => r.data)
        .catch(() => undefined);

export const objectsPerUserStats = async (
    token?: string,
    opts?: { signal?: AbortSignal }
): Promise<ObjectsPerUserStatsResponse | undefined> =>
    ax
        .get<ObjectsPerUserStatsResponse>(apiRoutes.objects.stats_per_user, {
            headers: token ? {Authorization: `Bearer ${token}`} : undefined,
            signal: opts?.signal,
        })
        .then((r) => r.data)
        .catch(() => undefined);

export const updateBookCreature = async (
    token: string | undefined,
    id: number,
    payload: Partial<BookCreatureCreatePayload>,
    opts?: { signal?: AbortSignal }
): Promise<AxiosResponse | undefined> =>
    ax
        .patch<BookCreature>(`${apiRoutes.objects.update}/${id}`, payload, {
            headers: token ? {Authorization: `Bearer ${token}`} : undefined,
            signal: opts?.signal,
        })
        .then((r) => r)
        .catch(() => undefined);

export async function migratePopulation(fromId: number, toId: number, token?: string, opts?: { signal?: AbortSignal }) {
    try {
        await ax.post(
            `${apiRoutes.objects.migrate_base}/${fromId}/migrate/${toId}`,
            undefined,
            {headers: token ? {Authorization: `Bearer ${token}`} : undefined, signal: opts?.signal}
        );
        return {ok: true as const};
    } catch (e: any) {
        const data = e?.response?.data as FormattedApiException | undefined;
        return {ok: false as const, status: e?.response?.status, ...data};
    }
}

export async function searchCitiesByName(
    name: string,
    token?: string,
    opts?: { signal?: AbortSignal }
): Promise<BookCreature[]> {
    try {
        const r = await ax.get<BookCreature[]>(
            `/api/v1/objects/search`,
            {
                params: {name},
                headers: token ? {Authorization: `Bearer ${token}`} : undefined,
                signal: opts?.signal
            }
        );
        return r.data || [];
    } catch (e: any) {
        if (e?.response?.status === 404) return [];
        throw e;
    }
}

export async function migrateHalfFromCapital(
    token?: string,
    opts?: { signal?: AbortSignal }
) {
    const res = await ax.post(
        apiRoutes.objects.migrate_half,
        null,
        {
            headers: token ? {Authorization: `Bearer ${token}`} : undefined,
            signal: opts?.signal,
            validateStatus: () => true,
        }
    );

    if (res.status >= 200 && res.status < 300) {
        return "Население переселено";
    }

    const data = res.data as FormattedApiException | undefined;
    return data?.message ?? `Ошибка ${res.status}`;
}

export async function createTestObjects(
    token?: string,
    opts?: { signal?: AbortSignal }
) {
    const res = await ax.post(
        `${apiRoutes.objects.test}`,
        null,
        {
            headers: token ? {Authorization: `Bearer ${token}`} : undefined,
            signal: opts?.signal,
            validateStatus: () => true,
        }
    );

    if (res.status >= 200 && res.status < 300) {
        return "Тестовые объекты созданы";
    }

    const data = res.data as FormattedApiException | undefined;
    return data?.message ?? `Ошибка ${res.status}`;
}

export const distributeRings = async (
    token?: string,
    opts?: { signal?: AbortSignal }
): Promise<{ ok: boolean; status?: number; errorCode?: string; message?: string } | undefined> => {
    try {
        const res = await ax.post(
            `${apiRoutes.objects.distribute_rings}`,
            null,
            {
                headers: token ? {Authorization: `Bearer ${token}`} : undefined,
                signal: opts?.signal,
                validateStatus: () => true,
            }
        );

        if (res.status >= 200 && res.status < 300) {
            return {ok: true};
        }

        const data = res.data as FormattedApiException | undefined;
        return {ok: false, status: res.status, ...data};
    } catch {
        return undefined;
    }
}

export const deleteOneByAttackLevel = async (
    attackLevel: number,
    token?: string,
    opts?: { signal?: AbortSignal }
): Promise<{ ok: boolean; status?: number; errorCode?: string; message?: string } | undefined> => {
    try {
        const res = await ax.delete(
            `${apiRoutes.objects.by_attack_level}/${attackLevel}`,
            {
                headers: token ? {Authorization: `Bearer ${token}`} : undefined,
                signal: opts?.signal,
                validateStatus: () => true,
            }
        );

        if (res.status >= 200 && res.status < 300) {
            return {ok: true};
        }

        const data = res.data as FormattedApiException | undefined;
        return {ok: false, status: res.status, ...data};
    } catch {
        return undefined;
    }
}

export const fetchUser = async (
    token?: string,
    opts?: { signal?: AbortSignal }
): Promise<UserResponse | undefined> =>
    ax
        .get<UserResponse>(apiRoutes.auth.fetch, {
            headers: token ? {Authorization: `Bearer ${token}`} : undefined,
            signal: opts?.signal,
        })
        .then((r) => r.data)
        .catch(() => undefined);

export const getCities = async (
    token?: string,
    page = 0,
    size = 10,
    sort = "id,asc",
    opts?: { signal?: AbortSignal }
): Promise<BookCreaturesResponse | undefined> =>
    ax
        .get<BookCreaturesResponse>(apiRoutes.objects.fetch, {
            params: {
                page,
                size,
                sort,
            },
            headers: token ? {Authorization: `Bearer ${token}`} : undefined,
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
    return ax
        .get<BookCreature>(`${apiRoutes.objects.fetch}/${id}`, {
            headers: token ? {Authorization: `Bearer ${token}`} : undefined,
            signal: opts?.signal,
        })
        .then((r) => r.data)
        .catch(() => undefined);
}

export const createBookCreature = async (
    token: string | undefined,
    payload: BookCreatureCreatePayload,
    opts?: { signal?: AbortSignal }
): Promise<AxiosResponse | undefined> =>
    ax
        .post<BookCreature>(apiRoutes.objects.create, payload, {
            headers: token ? {Authorization: `Bearer ${token}`} : undefined,
            signal: opts?.signal,
        })
        .then(r => r)
        .catch(() => undefined);

export const requestGoogleLogin = () => {
    const clientId =
        process.env.NEXT_PUBLIC_KC_CLIENT_ID ?? "web-front";
    const realm =
        process.env.NEXT_PUBLIC_KC_REALM ?? "lockbox";
    const base =
        process.env.NEXT_PUBLIC_KC_BASE_URL ??
        "http://localhost:8082";
    const redirectUri =
        process.env.NEXT_PUBLIC_AUTH_REDIRECT ??
        `${window.location.origin}/auth/callback`;

    const authUrl = `${base}/realms/${realm}/protocol/openid-connect/auth`;

    const params = new URLSearchParams({
        client_id: String(clientId),
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid",
        kc_idp_hint: "google",
    });

    window.location.href = `${authUrl}?${params.toString()}`;
};

export const exchangeCode = async (
    code: string
): Promise<TokenEndpointResponse | undefined> => {
    const clientId =
        process.env.NEXT_PUBLIC_KC_CLIENT_ID ?? "web-front";
    const realm =
        process.env.NEXT_PUBLIC_KC_REALM ?? "lockbox";
    const base =
        process.env.NEXT_PUBLIC_KC_BASE_URL ??
        "http://localhost:8082";
    const redirectUri =
        process.env.NEXT_PUBLIC_AUTH_REDIRECT ??
        `${window.location.origin}/auth/callback`;

    const tokenUrl = `${base}/realms/${realm}/protocol/openid-connect/token`;

    const params = new URLSearchParams({
        client_id: String(clientId),
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
    });

    return ax
        .post<TokenEndpointResponse>(tokenUrl, params, {
            headers: formHeaders,
        })
        .then((r) => r.data)
        .catch(() => undefined);
};

export const requestLogin = async (
    username: string,
    password: string
): Promise<TokenEndpointResponse | undefined> => {
    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);
    params.append(
        "client_id",
        process.env.NEXT_PUBLIC_KC_CLIENT_ID ?? "web-front"
    );
    params.append("grant_type", "password");

    return ax
        .post<TokenEndpointResponse>(apiRoutes.auth.token_endpoint, params, {
            headers: formHeaders,
        })
        .then((r) => r.data)
        .catch(() => undefined);
};

export const requestRefresh = async (
    refreshToken: string
): Promise<RefreshResponse | undefined> => {
    const params = new URLSearchParams();
    params.append("refresh_token", refreshToken);
    params.append(
        "client_id",
        process.env.NEXT_PUBLIC_KC_CLIENT_ID ?? "web-front"
    );
    params.append("grant_type", "refresh_token");

    return ax
        .post<RefreshResponse>(apiRoutes.auth.token_endpoint, params, {
            headers: formHeaders,
        })
        .then((r) => r.data)
        .catch(() => undefined);
};

export const requestLogout = async (
    token: string
): Promise<boolean> =>
    ax
        .post<void>(apiRoutes.auth.end_session_endpoint, {token})
        .then(() => true)
        .catch(() => false);

export const requestSignup = async (
    data: SignupRequest
): Promise<number | undefined> =>
    ax
        .post(apiRoutes.auth.signup, data)
        .then((r) => r.status)
        .catch(() => undefined);

type WsOp = 'create' | 'update' | 'delete';
type AnyMsg = unknown;
type CitiesWsEnvelope = { city?: BookCreature; id?: number; op: WsOp };

export function normalizeWs(e: AnyMsg): { op: WsOp | null; bookCreature?: BookCreature; id?: number } {
    let m: any = e;
    if (typeof m === 'string') {
        try {
            m = JSON.parse(m);
        } catch {
            return {op: null};
        }
    }

    console.log(m)

    if (m?.data && !m.bookCreature) m = {...m, ...m.data};
    if (m?.payload && !m.bookCreature) m = {...m, ...m.payload};

    const rawOp = (m?.op ?? m?.type ?? '').toString().toLowerCase();
    const op: WsOp | null = rawOp === 'create' || rawOp === 'update' || rawOp === 'delete' ? rawOp : null;

    const city: BookCreature | undefined = m?.bookCreature;
    const id =
        m?.id != null
            ? Number(m.id)
            : city?.id != null
                ? Number(city.id)
                : undefined;

    return {op, bookCreature: city, id};
}

export const openCitiesSocket = (onMessage: (data: CitiesWsEnvelope) => void, url = apiRoutes.ws.base) => {
    let ws: WebSocket | null = null;
    let closed = false;
    let attempt = 0;

    const connect = () => {
        ws = new WebSocket(url);
        console.log('Connecting to WS', url);

        ws.onopen = () => {
            attempt = 0;
        };
        ws.onmessage = (e) => {
            try {
                onMessage(JSON.parse(e.data) as CitiesWsEnvelope);
            } catch (e) {
                console.error('Failed to parse WS message', e)
            }
        };
        ws.onerror = () => {
            try {
                ws?.close();
            } catch {
            }
        };
        ws.onclose = () => {
            if (closed) return;
            const delay = Math.min(30000, 1000 * 2 ** attempt++);
            setTimeout(connect, delay);
        };
    };

    connect();
    return {
        close: () => {
            closed = true;
            try {
                ws?.close();
            } catch {
            }
        }
    };
};