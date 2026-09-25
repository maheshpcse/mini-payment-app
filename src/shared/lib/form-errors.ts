import { isApiError } from '../../api/errors';

export type FieldErrors = Record<string, string>;

/** Maps the API's `details: [{ path, message }]` onto form fields, prefixed with the field label. */
export function fieldErrorsFrom(error: unknown, labels: Record<string, string>): FieldErrors {
  if (!isApiError(error) || !Array.isArray(error.details)) return {};
  const result: FieldErrors = {};
  for (const detail of error.details as { path?: unknown; message?: unknown }[]) {
    if (typeof detail.path !== 'string' || typeof detail.message !== 'string') continue;
    const label = labels[detail.path];
    if (label && !result[detail.path]) result[detail.path] = `${label} ${detail.message}`;
  }
  return result;
}

export function errorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!isApiError(error)) return fallback;
  if (error.code === 'NETWORK_ERROR') return 'Cannot reach the MiNi Pay server. Check your connection and try again.';
  if (error.code === 'TIMEOUT') return 'The server took too long to respond. Please try again.';
  if (error.code === 'RATE_LIMITED') return 'Too many attempts. Please wait a few minutes and try again.';
  return error.message || fallback;
}
