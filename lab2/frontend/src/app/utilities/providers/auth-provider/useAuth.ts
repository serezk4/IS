import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {BasicUser} from "@/entities/auth";
import {fetchUser, requestLogout} from "./api-layer";
import {useTokenRotation} from "@/app/utilities/providers/auth-provider/useTokenRotation";
import {SignupRequest} from "@/app/utilities/providers/auth-provider/types";

type Status = "idle" | "loading" | "ready";

export const useAuth = () => {
    const {
        accessToken,
        login: tokenLogin,
        logout: tokenLogout,
        signup: tokenSignup,
        isAuthenticated: tokenIsAuth
    } = useTokenRotation();

    const [status, setStatus] = useState<Status>("idle");
    const [user, setUser] = useState<BasicUser | null>(null);

    const fetchSeq = useRef(0);

    const refreshUser = useCallback(async (): Promise<BasicUser | null> => {
        if (!accessToken) {
            setUser(null);
            return null;
        }

        setStatus("loading");
        const seq = ++fetchSeq.current;
        const ctrl = new AbortController();

        try {
            const profile = await fetchUser(accessToken, { signal: ctrl.signal });
            if (seq === fetchSeq.current) {
                setUser(profile ?? null);
                setStatus("ready");
            }
            return profile ?? null;
        } catch {
            if (seq === fetchSeq.current) {
                setUser(null);
                setStatus("ready");
            }
            return null;
        }
    }, [accessToken]);

    const login = useCallback(async (username: string, password: string): Promise<boolean> => {
        const auth = await tokenLogin({ username, password });
        if (!auth) {
            setUser(null);
            setStatus("ready");
            return false;
        }
        const profile = await refreshUser();
        return Boolean(profile);
    }, [tokenLogin, refreshUser]);

    const signup = useCallback(async (data: SignupRequest): Promise<boolean> => {
        const auth = await tokenSignup(data);
        if (!auth) {
            setUser(null);
            setStatus("ready");
            return false;
        }
        const profile = await refreshUser();
        return Boolean(profile);
    }, [tokenSignup, refreshUser]);

    const logout = useCallback(async (): Promise<void> => {

        try {
            if (accessToken) await requestLogout(accessToken);
        } catch {  }
        await tokenLogout();
        setUser(null);
        setStatus("ready");
    }, [accessToken, tokenLogout]);

    useEffect(() => {
        if (accessToken) {
            void refreshUser();
        } else {
            setUser(null);
            setStatus("ready");
        }
    }, [accessToken, refreshUser]);

    const isAuthenticated = useMemo(
        () => Boolean(tokenIsAuth && user),
        [tokenIsAuth, user]
    );

    const initialRender = useMemo(
        () => status !== "idle",
        [status]
    );

    return useMemo(() => ({
        status,                 
        isAuthenticated,        
        user,                   
        login,
        signup,
        logout,
        refreshUser,            
        setUser,                
        accessToken,
        initialRender
    }), [status, isAuthenticated, user, login, signup, logout, refreshUser, accessToken, initialRender]);
};
