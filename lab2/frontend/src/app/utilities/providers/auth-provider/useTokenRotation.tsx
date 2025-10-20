import {useCallback, useEffect, useRef, useState} from "react";
import {requestLogin, requestRefresh, requestSignup} from "@/app/utilities/providers/auth-provider/api-layer";

type LoginRequest = { username: string; password: string };
type SignupRequest = { email: string; password: string };
type LoginResponse = {
    access_token: string;
    refresh_token: string;
    access_expiration?: string;
    access_expires_in?: number;
};
type RefreshResponse = LoginResponse;

const REFRESH_KEY = "refreshToken";
const ACCESS_KEY = "accessToken";
const ACCESS_EXP_KEY = "accessExpMs";

const PREEMPTIVE_RATIO = 0.85;
const MIN_DELAY_MS = 10_000;
const MAX_DELAY_MS = 24 * 60 * 60 * 1000;
const isBrowser = typeof window !== "undefined";

function decodeJwtExpMs(token?: string): number | undefined {
    try {
        if (!token || !isBrowser) return;
        const base64Url = token.split(".")[1];
        if (!base64Url) return;
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(
            atob(base64)
                .split("")
                .map(c => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
                .join("")
        );
        const payload = JSON.parse(json) as { exp?: number };
        return payload.exp ? payload.exp * 1000 : undefined;
    } catch {
        return;
    }
}

type TokenState = {
    accessToken?: string;
    refreshToken?: string;
    accessExpMs?: number;
};

export function useTokenRotation() {
    const [state, setState] = useState<TokenState>({});
    const timerRef = useRef<number | null>(null);
    const refreshingRef = useRef(false);

    const clearTimer = () => {
        if (!isBrowser) return;
        if (timerRef.current !== null) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const persist = useCallback((s: TokenState) => {
        if (!isBrowser) return;
        if (s.accessToken) sessionStorage.setItem(ACCESS_KEY, s.accessToken);
        else sessionStorage.removeItem(ACCESS_KEY);

        if (s.refreshToken) localStorage.setItem(REFRESH_KEY, s.refreshToken);
        else localStorage.removeItem(REFRESH_KEY);

        if (s.accessExpMs) localStorage.setItem(ACCESS_EXP_KEY, String(s.accessExpMs));
        else localStorage.removeItem(ACCESS_EXP_KEY);
    }, []);

    const nextDelay = (expMs?: number) => {
        if (!expMs) return MIN_DELAY_MS;
        const now = Date.now();
        let delay = Math.floor((expMs - now) * PREEMPTIVE_RATIO);
        delay = Math.max(delay, MIN_DELAY_MS);
        delay = Math.min(delay, MAX_DELAY_MS);
        return delay;
    };

    const schedule = useCallback((expMs?: number) => {
        if (!isBrowser) return;
        clearTimer();
        const delay = nextDelay(expMs);
        timerRef.current = window.setTimeout(() => {
            void refreshNow();
        }, delay);
    }, []);

    const computeAccessExpMs = (res: {
        access_expiration?: string;
        access_expires_in?: number;
        access_token: string;
    }) => {
        if (res.access_expiration) return Date.parse(res.access_expiration);
        if (typeof res.access_expires_in === "number")
            return Date.now() + res.access_expires_in * 1000;
        return decodeJwtExpMs(res.access_token);
    };

    const refreshNow = useCallback(async () => {
        if (!isBrowser) return;
        if (refreshingRef.current) return;
        refreshingRef.current = true;
        try {
            const rt = state.refreshToken ?? localStorage.getItem(REFRESH_KEY) ?? undefined;
            if (!rt) return;

            const res: RefreshResponse | undefined = await requestRefresh(rt);
            if (!res?.access_token) {
                clearTimer();
                timerRef.current = window.setTimeout(() => void refreshNow(), 30_000);
                return;
            }

            const accessExpMs = computeAccessExpMs(res);
            const next: TokenState = {
                accessToken: res.access_token,
                refreshToken: res.refresh_token ?? rt,
                accessExpMs
            };
            setState(next);
            persist(next);
            schedule(accessExpMs);
        } catch {
            clearTimer();
            timerRef.current = window.setTimeout(() => void refreshNow(), 30_000);
        } finally {
            refreshingRef.current = false;
        }
    }, [persist, schedule, state.refreshToken]);

    const login = useCallback(async (data: LoginRequest): Promise<LoginResponse | undefined> => {
        const res = await requestLogin(data.username, data.password);
        if (!res) return;
        const accessExpMs = computeAccessExpMs(res);
        const next: TokenState = {
            accessToken: res.access_token,
            refreshToken: res.refresh_token,
            accessExpMs
        };
        setState(next);
        persist(next);
        schedule(accessExpMs);
        return res;
    }, [persist, schedule]);

    const logout = useCallback(() => {
        clearTimer();
        const empty: TokenState = {};
        setState(empty);
        persist(empty);
    }, [persist]);

    const signup = useCallback(async (data: SignupRequest): Promise<LoginResponse | undefined> => {
        const status = await requestSignup(data);
        if (status !== 201) return;
        return await login({username: data.email, password: data.password});
    }, [login]);

    useEffect(() => {
        if (!isBrowser) return;

        const refreshToken = localStorage.getItem(REFRESH_KEY) ?? undefined;
        const accessToken = sessionStorage.getItem(ACCESS_KEY) ?? undefined;
        const storedExp = localStorage.getItem(ACCESS_EXP_KEY);
        const accessExpMs = storedExp ? Number(storedExp) : decodeJwtExpMs(accessToken);

        if (refreshToken || accessToken) {
            const init: TokenState = {refreshToken, accessToken, accessExpMs};
            setState(init);
            persist(init);

            if (!accessToken || (accessExpMs && accessExpMs - Date.now() < MIN_DELAY_MS)) {
                void refreshNow();
            } else {
                schedule(accessExpMs);
            }
        }

        const onStorage = (e: StorageEvent) => {
            if (e.key === REFRESH_KEY) {
                const rt = e.newValue ?? undefined;
                if (!rt) {
                    logout();
                } else {
                    setState(prev => ({...prev, refreshToken: rt}));
                    void refreshNow();
                }
            }
        };
        window.addEventListener("storage", onStorage);

        const onVis = () => {
            if (document.visibilityState === "visible") void refreshNow();
        };
        window.addEventListener("visibilitychange", onVis);

        return () => {
            window.removeEventListener("storage", onStorage);
            window.removeEventListener("visibilitychange", onVis);
            clearTimer();
        };
    }, [logout, persist, refreshNow, schedule]);

    const setTokenState = useCallback((next: TokenState) => {
        setState(next);
        persist(next);
        schedule(next.accessExpMs);
    }, [persist, schedule]);

    return {
        login,
        logout,
        signup,
        refreshNow,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: Boolean(state.accessToken && state.refreshToken),
        setTokenState
    };
}
