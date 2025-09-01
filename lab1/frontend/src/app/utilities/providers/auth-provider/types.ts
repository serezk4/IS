export type AccessToken = string & { readonly __brand: "AccessToken" };
export type RefreshToken = string & { readonly __brand: "RefreshToken" };
export type ISODateTime = string;

export interface UserClaims {
    sub: string;
    preferred_username?: string;
    name?: string | null;
    given_name?: string | null;
    family_name?: string | null;
    email?: string;
    email_verified?: boolean;
    iss?: string;
    aud?: string | string[];
    azp?: string;
    sid?: string | null;
    acr?: string | null;
    scope?: string;
    roles?: string[];
    allowed_origins?: string[];
    exp: number;
    iat: number;
    auth_time?: number;
    jti?: string;
}

export type UserResponse = UserClaims

export type CityCreatePayload = {
    name: string;
    coordinates: { x: number; y: number };
    population: number;
    climate: "HUMIDSUBTROPICAL" | "OCEANIC" | "MEDITERRANIAN" | "TUNDRA";
    government: "PUPPET_STATE" | "THALASSOCRACY" | "TELLUROCRACY";
    governor: { birthday: string | null };
    timezone: number;
    metersAboveSeaLevel: number;
    area?: number | null;
    creationDate?: string | null;
    establishmentDate?: string | null;
    capital?: boolean | null;
};

export type BasicUser = {
    id: string;
    email?: string;
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    username?: string;
    roles?: string[];
    allowedOrigins?: string[];
};

export function toBasicUser(claims: UserClaims): BasicUser {
    return {
        id: claims.sub,
        email: claims.email,
        name: claims.name ?? null,
        firstName: claims.given_name ?? null,
        lastName: claims.family_name ?? null,
        username: claims.preferred_username,
        roles: claims.roles,
        allowedOrigins: claims.allowed_origins,
    };
}

export interface SignupRequest {
    email: string;
    password: string;
    passwordRepeat: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface AuthResponse {
    access_token: AccessToken | string;
    refresh_token: RefreshToken | string;
    user?: UserResponse;
    access_expiration?: ISODateTime;
    access_expires_in?: number;
}

export interface RefreshRequest {
    refresh_token: RefreshToken | string;
}

export interface RefreshResponse {
    access_token: AccessToken | string;
    refresh_token?: RefreshToken | string;
    access_expiration?: ISODateTime;
    access_expires_in?: number;
}

export interface TokenPair {
    access_token: AccessToken | string;
    refresh_token: RefreshToken | string;
}

export type TokenResponse = TokenPair;

export function isAuthResponse(x: unknown): x is AuthResponse {
    return Boolean(
        x &&
        typeof x === "object" &&
        "access_token" in x &&
        "refresh_token" in x
    );
}

export function isRefreshResponse(x: unknown): x is RefreshResponse {
    return Boolean(
        x &&
        typeof x === "object" &&
        "access_token" in x
    );
}

export const asAccessToken = (t: string): AccessToken => t as AccessToken;
export const asRefreshToken = (t: string): RefreshToken => t as RefreshToken;

export const STORAGE_KEYS = {
    refreshToken: "refreshToken",
    accessToken: "accessToken",
    accessExpMs: "accessExpMs",
} as const;
