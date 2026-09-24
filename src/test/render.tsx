import { QueryClient } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { AppProviders } from '../app/AppProviders';
import { routes } from '../app/routes';
import { sessionStore } from '../features/auth/session-store';
import type { User } from '../features/auth/types';
import { grantFor, TEST_USER } from './api-mock';

/**
 * Renders the full route tree. Signed in as TEST_USER by default; pass
 * `user: null` to start signed out (the app then attempts a cookie refresh).
 */
export function renderApp(initialPath = '/', options: { user?: User | null } = {}) {
  const user = options.user === undefined ? TEST_USER : options.user;
  if (user) sessionStore.setGrant(grantFor(user));
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] });
  const utils = render(
    <AppProviders queryClient={queryClient}>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return { ...utils, router, queryClient };
}
