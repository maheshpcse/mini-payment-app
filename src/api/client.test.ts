import { describe, expect, it, vi } from 'vitest';
import { createApiClient } from './client';
import { ApiError } from './errors';

function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });
}

function setup(fetchImpl: typeof fetch, options: { defaultTimeoutMs?: number } = {}) {
  return createApiClient({ baseUrl: 'http://api.test/api/v1', fetchImpl, retryDelayMs: 1, ...options });
}

describe('api client', () => {
  it('unwraps the data envelope and sends a request id', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(200, { data: { ok: true } }, { 'x-request-id': 'srv-123' }));
    const client = setup(fetchImpl);

    const response = await client.request<{ ok: boolean }>('/health');

    expect(response).toEqual({ status: 200, requestId: 'srv-123', data: { ok: true } });
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe('http://api.test/api/v1/health');
    expect((init!.headers as Record<string, string>)['X-Request-Id']).toMatch(/.{8,}/);
    expect(init!.credentials).toBe('include');
  });

  it('serializes JSON bodies', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(201, { data: { id: 'x' } }));
    await setup(fetchImpl).request('/things', { method: 'POST', body: { amountMinor: 1023 } });
    const init = fetchImpl.mock.calls[0]![1]!;
    expect(init.body).toBe('{"amountMinor":1023}');
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });

  it('normalizes the server error contract', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse(409, {
        error: { code: 'PAYMENT_INVALID_STATE', message: 'Nope', requestId: 'req-9', details: { from: 'SUCCESS' } },
      }),
    );
    const error = await setup(fetchImpl).request('/payments/1/authorize', { method: 'POST' }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code: 'PAYMENT_INVALID_STATE', status: 409, requestId: 'req-9', details: { from: 'SUCCESS' } });
  });

  it('reports network failures without leaking internals', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch'));
    const error = await setup(fetchImpl).request('/health').catch((e: unknown) => e);
    expect(error).toMatchObject({ code: 'NETWORK_ERROR', status: 0 });
  });

  it('times out slow requests', async () => {
    const fetchImpl = vi.fn<typeof fetch>((_url, init) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
      });
    });
    const error = await setup(fetchImpl, { defaultTimeoutMs: 20 }).request('/slow').catch((e: unknown) => e);
    expect(error).toMatchObject({ code: 'TIMEOUT', status: 0 });
  });

  it('supports caller cancellation', async () => {
    const controller = new AbortController();
    const fetchImpl = vi.fn<typeof fetch>((_url, init) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
      });
    });
    const pending = setup(fetchImpl).request('/slow', { signal: controller.signal }).catch((e: unknown) => e);
    controller.abort();
    expect(await pending).toMatchObject({ code: 'ABORTED' });
  });

  it('retries safe GET requests on transient failures with the same request id', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(503, { error: { code: 'SERVICE_UNAVAILABLE', message: 'down' } }))
      .mockResolvedValueOnce(jsonResponse(200, { data: 'ok' }));
    const response = await setup(fetchImpl).request('/health', { retries: 2 });
    expect(response.data).toBe('ok');
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    const ids = fetchImpl.mock.calls.map(([, init]) => (init!.headers as Record<string, string>)['X-Request-Id']);
    expect(ids[0]).toBe(ids[1]);
  });

  it('never retries non-GET requests', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(503, { error: { code: 'SERVICE_UNAVAILABLE', message: 'x' } }));
    await setup(fetchImpl).request('/payments', { method: 'POST', body: {}, retries: 3 }).catch(() => undefined);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('does not retry client errors', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(400, { error: { code: 'VALIDATION_FAILED', message: 'bad' } }));
    await setup(fetchImpl).request('/health', { retries: 3 }).catch(() => undefined);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('accepts explicitly allowed non-2xx statuses', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(503, { data: { status: 'not_ready' } }));
    const response = await setup(fetchImpl).request('/health/ready', { acceptStatuses: [503] });
    expect(response).toMatchObject({ status: 503, data: { status: 'not_ready' } });
  });

  it('flags unreadable responses', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(new Response('<html>proxy error</html>', { status: 502 }));
    const error = await setup(fetchImpl).request('/health').catch((e: unknown) => e);
    expect(error).toMatchObject({ code: 'INVALID_RESPONSE', status: 502 });
  });
});
