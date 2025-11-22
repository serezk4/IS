export interface User {
  sub: string;
  email: string;
  name?: string;
  realm_access?: {
    roles: string[];
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessExpiration?: string;
  accessExpiresIn?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  access_expiration?: string;
  access_expires_in?: number;
}

export interface UserResponse {
  sub: string;
  email: string;
  name?: string;
  realm_access?: {
    roles: string[];
  };
}
