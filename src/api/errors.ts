/** Client-side error codes for failures that never reached the API's error contract. */
export type ClientErrorCode = 'NETWORK_ERROR' | 'TIMEOUT' | 'ABORTED' | 'INVALID_RESPONSE';

export interface ApiErrorShape {
  code: string;
  message: string;
  status: number;
  requestId?: string;
  details?: unknown;
}

/**
 * Normalized error for every API failure. `code` is either a server error code
 * from docs/API_CONTRACTS.md (backend) or a ClientErrorCode.
 */
export class ApiError extends Error implements ApiErrorShape {
  readonly code: string;
  readonly status: number;
  readonly requestId?: string;
  readonly details?: unknown;

  constructor(shape: ApiErrorShape) {
    super(shape.message);
    this.name = 'ApiError';
    this.code = shape.code;
    this.status = shape.status;
    this.requestId = shape.requestId;
    this.details = shape.details;
  }

  get isClientError(): boolean {
    return this.status === 0;
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}
