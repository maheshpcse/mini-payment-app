const DEFAULT_API_BASE_URL = 'http://localhost:4000/api/v1';

export const appConfig = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') || DEFAULT_API_BASE_URL,
  appEnv: (import.meta.env.VITE_APP_ENV as string | undefined) || 'local',
  version: __APP_VERSION__,
  /** The app operates in sandbox mode only until an approved provider integration exists. */
  paymentMode: 'sandbox' as const,
};
