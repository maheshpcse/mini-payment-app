import { apiClient } from '../../api/client';
import { ApiError } from '../../api/errors';
import type { SessionGrant, User } from './types';

export type SessionStatus = 'unknown' | 'authenticated' | 'anonymous';

export interface SessionState {
  status: SessionStatus;
  user: User | null;
  accessToken: string | null;
  /** Set when the user chose to sign out, so the sign-in page can confirm it. */
  signedOut?: boolean;
}

const ANONYMOUS: SessionState = { status: 'anonymous', user: null, accessToken: null };
/** Refresh this long before the access token expires so requests rarely see a 401. */
const REFRESH_LEAD_MS = 60_000;

/**
 * The access token lives only in memory. The refresh token is an HttpOnly
 * cookie the page can never read, so a reload restores the session through
 * POST /auth/refresh rather than from storage.
 */
function createSessionStore() {
  let state: SessionState = { status: 'unknown', user: null, accessToken: null };
  const listeners = new Set<() => void>();
  let inflight: Promise<string | null> | null = null;
  let refreshTimer: ReturnType<typeof setTimeout> | undefined;

  function set(next: SessionState) {
    state = next;
    listeners.forEach((listener) => listener());
  }

  function schedule(expiresIn: number) {
    clearTimeout(refreshTimer);
    const delay = Math.max(expiresIn * 1000 - REFRESH_LEAD_MS, 10_000);
    refreshTimer = setTimeout(() => void store.refresh(), delay);
  }

  const store = {
    getState: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setGrant(grant: SessionGrant) {
      set({ status: 'authenticated', user: grant.user, accessToken: grant.accessToken });
      schedule(grant.expiresIn);
    },
    setUser(user: User) {
      if (state.status === 'authenticated') set({ ...state, user });
    },
    clear(options: { signedOut?: boolean } = {}) {
      clearTimeout(refreshTimer);
      set(options.signedOut ? { ...ANONYMOUS, signedOut: true } : ANONYMOUS);
    },
    /** Back to the pre-bootstrap state, as on a fresh page load. */
    reset() {
      clearTimeout(refreshTimer);
      inflight = null;
      set({ status: 'unknown', user: null, accessToken: null });
    },
    /** Single-flight: concurrent 401s share one refresh, so a rotated token is never replayed. */
    refresh(): Promise<string | null> {
      inflight ??= apiClient
        .request<SessionGrant>('/auth/refresh', { method: 'POST', anonymous: true })
        .then(({ data }) => {
          store.setGrant(data);
          return data.accessToken;
        })
        .catch((err: unknown) => {
          if (err instanceof ApiError && err.isClientError && state.status === 'authenticated') {
            // Offline: keep the current session and retry shortly instead of signing out.
            schedule(30);
            return null;
          }
          store.clear();
          return null;
        })
        .finally(() => {
          inflight = null;
        });
      return inflight;
    },
    /** Resolves the initial unknown state once per page load. */
    bootstrap() {
      if (state.status === 'unknown') void store.refresh();
    },
  };
  return store;
}

export const sessionStore = createSessionStore();

apiClient.setAuthHooks({
  getAccessToken: () => sessionStore.getState().accessToken,
  refreshAccessToken: () => sessionStore.refresh(),
});
