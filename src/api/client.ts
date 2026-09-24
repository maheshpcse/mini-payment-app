import { appConfig } from '../config/env';
import { ApiError } from './errors';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeoutMs?: number;
  /**
   * Retries apply only to safe methods (GET) and transient failures. Money-moving
   * requests rely on the backend Idempotency-Key contract instead of blind retries.
   */
  retries?: number;
  /** Treat these HTTP statuses as successful responses (e.g. 503 from readiness). */
  acceptStatuses?: number[];
}

export interface ApiResponse<T> {
  status: number;
  requestId?: string;
  data: T;
}

export interface ApiClientOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
  defaultTimeoutMs?: number;
  retryDelayMs?: number;
}

const RETRYABLE_STATUSES = new Set([502, 503, 504]);

function createRequestId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new ApiError({ code: 'ABORTED', message: 'The request was cancelled.', status: 0 }));
      },
      { once: true },
    );
  });
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError({
      code: 'INVALID_RESPONSE',
      message: 'The server returned an unreadable response.',
      status: response.status,
      requestId: response.headers.get('x-request-id') ?? undefined,
    });
  }
}

function toServerError(status: number, body: unknown, requestId: string | undefined): ApiError {
  const error = (body as { error?: Partial<ApiError> } | undefined)?.error;
  return new ApiError({
    code: typeof error?.code === 'string' ? error.code : 'HTTP_ERROR',
    message: typeof error?.message === 'string' ? error.message : `Request failed with status ${status}.`,
    status,
    requestId: typeof error?.requestId === 'string' ? error.requestId : requestId,
    details: error?.details,
  });
}

export function createApiClient({ baseUrl, fetchImpl, defaultTimeoutMs = 10_000, retryDelayMs = 400 }: ApiClientOptions) {
  const doFetch = fetchImpl ?? ((...args: Parameters<typeof fetch>) => globalThis.fetch(...args));

  async function attempt<T>(path: string, options: RequestOptions, requestId: string): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, options.timeoutMs ?? defaultTimeoutMs);
    const onCallerAbort = () => controller.abort();
    options.signal?.addEventListener('abort', onCallerAbort, { once: true });

    try {
      const headers: Record<string, string> = { Accept: 'application/json', 'X-Request-Id': requestId, ...options.headers };
      if (options.body !== undefined) headers['Content-Type'] = 'application/json';

      let response: Response;
      try {
        response = await doFetch(`${baseUrl}${path}`, {
          method: options.method ?? 'GET',
          headers,
          body: options.body === undefined ? undefined : JSON.stringify(options.body),
          signal: controller.signal,
          credentials: 'include',
        });
      } catch {
        if (timedOut) throw new ApiError({ code: 'TIMEOUT', message: 'The server took too long to respond.', status: 0, requestId });
        if (options.signal?.aborted) throw new ApiError({ code: 'ABORTED', message: 'The request was cancelled.', status: 0, requestId });
        throw new ApiError({ code: 'NETWORK_ERROR', message: 'The server could not be reached.', status: 0, requestId });
      }

      const responseRequestId = response.headers.get('x-request-id') ?? requestId;
      const body = await parseBody(response);
      if (!response.ok && !options.acceptStatuses?.includes(response.status)) {
        throw toServerError(response.status, body, responseRequestId);
      }
      const data = (body as { data?: T } | undefined)?.data ?? (body as T);
      return { status: response.status, requestId: responseRequestId, data };
    } finally {
      clearTimeout(timer);
      options.signal?.removeEventListener('abort', onCallerAbort);
    }
  }

  async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const method = options.method ?? 'GET';
    const maxRetries = method === 'GET' ? (options.retries ?? 0) : 0;
    // One id per logical request so server logs correlate all retry attempts.
    const requestId = createRequestId();

    for (let attemptNumber = 0; ; attemptNumber += 1) {
      try {
        return await attempt<T>(path, options, requestId);
      } catch (err) {
        const retryable =
          err instanceof ApiError &&
          (err.code === 'NETWORK_ERROR' || err.code === 'TIMEOUT' || RETRYABLE_STATUSES.has(err.status));
        if (!retryable || attemptNumber >= maxRetries || options.signal?.aborted) throw err;
        await sleep(retryDelayMs * 2 ** attemptNumber, options.signal);
      }
    }
  }

  return { request };
}

export type ApiClient = ReturnType<typeof createApiClient>;

export const apiClient = createApiClient({ baseUrl: appConfig.apiBaseUrl });
