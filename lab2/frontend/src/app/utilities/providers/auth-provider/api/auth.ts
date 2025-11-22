import { apiClient, formHeaders } from './client';
import { apiRoutes } from '@/app/routing';
import { RefreshResponse, SignupRequest, UserResponse } from '../types';

type TokenEndpointResponse = {
  access_token: string;
  refresh_token: string;
  access_expiration?: string;
  access_expires_in?: number;
};

export const requestGoogleLogin = () => {
  const clientId = process.env.NEXT_PUBLIC_KC_CLIENT_ID ?? 'web-front';
  const realm = process.env.NEXT_PUBLIC_KC_REALM ?? 'lockbox';
  const base = process.env.NEXT_PUBLIC_KC_BASE_URL ?? 'http://localhost:8082';//localhost:8082';
  const redirectUri = process.env.NEXT_PUBLIC_AUTH_REDIRECT ?? `${window.location.origin}/auth/callback`;

  const authUrl = `${base}/realms/${realm}/protocol/openid-connect/auth`;

  const params = new URLSearchParams({
    client_id: String(clientId),
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid',
    kc_idp_hint: 'google',
  });

  window.location.href = `${authUrl}?${params.toString()}`;
};

export const exchangeCode = async (code: string): Promise<TokenEndpointResponse | undefined> => {
  const clientId = process.env.NEXT_PUBLIC_KC_CLIENT_ID ?? 'web-front';
  const realm = process.env.NEXT_PUBLIC_KC_REALM ?? 'lockbox';
  const base = process.env.NEXT_PUBLIC_KC_BASE_URL ?? 'http://localhost:8082';//localhost:8082';
  const redirectUri = process.env.NEXT_PUBLIC_AUTH_REDIRECT ?? `${window.location.origin}/auth/callback`;

  const tokenUrl = `${base}/realms/${realm}/protocol/openid-connect/token`;

  const params = new URLSearchParams({
    client_id: String(clientId),
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
  });

  return apiClient
    .post<TokenEndpointResponse>(tokenUrl, params, {
      headers: formHeaders,
    })
    .then((r) => r.data)
    .catch(() => undefined);
};

export const requestLogin = async (username: string, password: string): Promise<TokenEndpointResponse | undefined> => {
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);
  params.append('client_id', process.env.NEXT_PUBLIC_KC_CLIENT_ID ?? 'web-front');
  params.append('grant_type', 'password');

  return apiClient
    .post<TokenEndpointResponse>(apiRoutes.auth.token_endpoint, params, {
      headers: formHeaders,
    })
    .then((r) => r.data)
    .catch(() => undefined);
};

export const requestRefresh = async (refreshToken: string): Promise<RefreshResponse | undefined> => {
  const params = new URLSearchParams();
  params.append('refresh_token', refreshToken);
  params.append('client_id', process.env.NEXT_PUBLIC_KC_CLIENT_ID ?? 'web-front');
  params.append('grant_type', 'refresh_token');

  return apiClient
    .post<RefreshResponse>(apiRoutes.auth.token_endpoint, params, {
      headers: formHeaders,
    })
    .then((r) => r.data)
    .catch(() => undefined);
};

export const requestLogout = async (token: string): Promise<boolean> =>
  apiClient
    .post<void>(apiRoutes.auth.end_session_endpoint, { token })
    .then(() => true)
    .catch(() => false);

export const requestSignup = async (data: SignupRequest): Promise<number | undefined> =>
  apiClient
    .post(apiRoutes.auth.signup, data)
    .then((r) => r.status)
    .catch(() => undefined);

export const fetchUser = async (
  token?: string,
  opts?: { signal?: AbortSignal }
): Promise<UserResponse | undefined> =>
  apiClient
    .get<UserResponse>(apiRoutes.auth.fetch, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      signal: opts?.signal,
    })
    .then((r) => r.data)
    .catch(() => undefined);
