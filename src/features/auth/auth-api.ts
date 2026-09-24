import { apiClient } from '../../api/client';
import { appConfig } from '../../config/env';
import type { ActiveSession, SessionGrant, User } from './types';

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
}

export const authApi = {
  register: (body: RegisterInput) => apiClient.request<SessionGrant>('/auth/register', { method: 'POST', body, anonymous: true }).then((r) => r.data),
  login: (body: { email: string; password: string }) =>
    apiClient.request<SessionGrant>('/auth/login', { method: 'POST', body, anonymous: true }).then((r) => r.data),
  logout: () => apiClient.request<void>('/auth/logout', { method: 'POST', anonymous: true }),
  logoutAll: () => apiClient.request<void>('/auth/logout-all', { method: 'POST' }),
  forgotPassword: (email: string) =>
    apiClient
      .request<{ accepted: true; sandboxResetToken?: string }>('/auth/password/forgot', { method: 'POST', body: { email }, anonymous: true })
      .then((r) => r.data),
  resetPassword: (token: string, password: string) =>
    apiClient.request<void>('/auth/password/reset', { method: 'POST', body: { token, password }, anonymous: true }),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.request<void>('/auth/password/change', { method: 'POST', body: { currentPassword, newPassword } }),
  sessions: () => apiClient.request<ActiveSession[]>('/auth/sessions').then((r) => r.data),
  revokeSession: (id: string) => apiClient.request<void>(`/auth/sessions/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

export const profileApi = {
  me: () => apiClient.request<User>('/users/me').then((r) => r.data),
  update: (body: { firstName?: string; lastName?: string; phone?: string | null }) =>
    apiClient.request<User>('/users/me', { method: 'PATCH', body }).then((r) => r.data),
  uploadAvatar: (image: Blob) => apiClient.request<User>('/users/me/avatar', { method: 'PUT', rawBody: image, timeoutMs: 30_000 }).then((r) => r.data),
  removeAvatar: () => apiClient.request<User>('/users/me/avatar', { method: 'DELETE' }).then((r) => r.data),
};

export function apiAssetUrl(path: string | null): string | null {
  return path ? `${appConfig.apiBaseUrl}${path}` : null;
}
