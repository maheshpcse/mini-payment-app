import { useEffect, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { sessionStore } from './session-store';
import { SessionSplash } from './SessionSplash';
import { useSession } from './useSession';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status, signedOut } = useSession();
  const location = useLocation();

  useEffect(() => sessionStore.bootstrap(), []);

  if (status === 'unknown') return <SessionSplash />;
  if (status === 'anonymous') {
    if (signedOut) return <Navigate to="/login" replace state={{ signedOut: true }} />;
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={next === '/' ? '/login' : `/login?next=${encodeURIComponent(next)}`} replace />;
  }
  return <>{children}</>;
}
