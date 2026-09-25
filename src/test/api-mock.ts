import { vi } from 'vitest';
import type { User } from '../features/auth/types';

export const TEST_USER: User = {
  id: 'usr_0123456789abcdef0123',
  firstName: 'Asha',
  lastName: 'Verma',
  fullName: 'Asha Verma',
  initials: 'AV',
  email: 'asha@example.com',
  emailVerified: false,
  phone: null,
  avatarUrl: null,
  roles: ['USER'],
  isDemo: false,
  createdAt: '2026-01-15T10:00:00.000Z',
};

export const TEST_PREFERENCES = {
  notifications: {
    channels: { push: false, email: true, sms: false },
    events: { payments: true, requests: true, promotions: false, security: true },
  },
  payments: { perTransactionLimitMinor: 1_000_000, dailyLimitMinor: 2_500_000, hideBalance: false },
  ceilings: { perTransactionMinor: 10_000_000, dailyMinor: 20_000_000 },
};

export const TEST_WALLET = {
  currency: 'INR',
  balanceMinor: 0,
  ledgerAvailable: false,
  sandbox: true,
  linked: { bankAccounts: 0, upiIds: 0 },
  defaultMethodId: null,
};

type Reply = { status?: number; body?: unknown } | ((request: { body: unknown; headers: Headers }) => { status?: number; body?: unknown });

export interface ApiCall {
  method: string;
  path: string;
  body: unknown;
  headers: Headers;
}

/**
 * Route-aware fetch stub keyed by "METHOD /path" (path relative to /api/v1).
 * Unmatched requests get sensible defaults so pages render without setup.
 */
export function mockApi(routes: Record<string, Reply> = {}) {
  const calls: ApiCall[] = [];
  const defaults: Record<string, Reply> = {
    'GET /health/ready': { body: { data: { status: 'ready', dependencies: [] } } },
    'POST /auth/refresh': { status: 401, body: { error: { code: 'AUTH_SESSION_EXPIRED', message: 'Your session has ended.', requestId: 'r' } } },
    'POST /auth/logout': { status: 204 },
    'GET /users/me/preferences': { body: { data: TEST_PREFERENCES } },
    'GET /wallets/me': { body: { data: TEST_WALLET } },
    'GET /payment-methods': { body: { data: [] } },
    'GET /auth/sessions': { body: { data: [] } },
  };

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
    const path = url.pathname.replace(/^\/api\/v1/, '');
    const method = (init?.method ?? 'GET').toUpperCase();
    const headers = new Headers(init?.headers);
    const body = typeof init?.body === 'string' ? (JSON.parse(init.body) as unknown) : init?.body;
    calls.push({ method, path, body, headers });

    const key = `${method} ${path}`;
    const reply = routes[key] ?? defaults[key] ?? { status: 404, body: { error: { code: 'ROUTE_NOT_FOUND', message: 'Not mocked', requestId: 'r' } } };
    const resolved = typeof reply === 'function' ? reply({ body, headers }) : reply;
    const status = resolved.status ?? 200;
    return new Response(status === 204 || resolved.body === undefined ? null : JSON.stringify(resolved.body), { status });
  });

  vi.stubGlobal('fetch', fetchMock);
  return { fetchMock, calls, callsTo: (key: string) => calls.filter((call) => `${call.method} ${call.path}` === key) };
}

export function grantFor(user: User = TEST_USER) {
  return { accessToken: 'access-token', tokenType: 'Bearer' as const, expiresIn: 900, user };
}
