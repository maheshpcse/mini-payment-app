import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useSyncExternalStore } from 'react';
import { authApi } from './auth-api';
import { sessionStore, type SessionState } from './session-store';

export function useSession(): SessionState {
  return useSyncExternalStore(sessionStore.subscribe, sessionStore.getState);
}

export function useCurrentUser() {
  const { user } = useSession();
  if (!user) throw new Error('useCurrentUser must be used inside an authenticated route');
  return user;
}

/** Signs out locally even if the server call fails, and drops cached user data. */
export function useSignOut() {
  const queryClient = useQueryClient();
  return useCallback(
    async (options: { everywhere?: boolean } = {}) => {
      try {
        await (options.everywhere ? authApi.logoutAll() : authApi.logout());
      } catch {
        // The session is discarded client-side regardless.
      }
      // RequireAuth performs the redirect to /login once the session is gone.
      sessionStore.clear({ signedOut: true });
      queryClient.clear();
    },
    [queryClient],
  );
}
