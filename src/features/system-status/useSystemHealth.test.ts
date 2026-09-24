import { describe, expect, it, vi } from 'vitest';
import { createApiClient } from '../../api/client';
import { fetchSystemHealth } from './useSystemHealth';

function clientReturning(response: Response | Error) {
  const fetchImpl = vi.fn<typeof fetch>(() => (response instanceof Error ? Promise.reject(response) : Promise.resolve(response.clone())));
  return createApiClient({ baseUrl: 'http://api.test/api/v1', fetchImpl, retryDelayMs: 1 });
}

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });

describe('fetchSystemHealth', () => {
  it('is online when the backend is ready', async () => {
    const client = clientReturning(
      json(200, { data: { status: 'ready', dependencies: [{ name: 'mongodb', status: 'up', latencyMs: 3 }] } }),
    );
    await expect(fetchSystemHealth(client)).resolves.toMatchObject({ state: 'online', dependencies: [{ name: 'mongodb' }] });
  });

  it('is degraded when readiness returns 503', async () => {
    const client = clientReturning(
      json(503, { data: { status: 'not_ready', dependencies: [{ name: 'redis', status: 'down', latencyMs: 0 }] } }),
    );
    await expect(fetchSystemHealth(client)).resolves.toMatchObject({ state: 'degraded' });
  });

  it('is offline when the backend cannot be reached', async () => {
    const client = clientReturning(new TypeError('Failed to fetch'));
    await expect(fetchSystemHealth(client)).resolves.toEqual({ state: 'offline', dependencies: [] });
  });
});
