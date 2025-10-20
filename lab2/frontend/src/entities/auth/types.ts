export type UserPreferences = Record<string, unknown>

export type BasicUser = {
    sub: string;
    email_verified: boolean;
    allowed_origins: string[];
    roles: string[];
    issuer: string;
    preferred_username: string;
    given_name: string | null;
    family_name: string | null;
    realm_access: {
        roles: string[];
    }
    sid: string;
    acr: string;
    azp: string;
    scope: string;
    name: string | null;
    email: string;
    exp: number;
    iat: number;
    jti: string;
}

export type StudentUser = BasicUser & {
    type: 'student';
    preferences: UserPreferences;
}

export type AdvisorUser = BasicUser & {
    type: 'advisor';
}