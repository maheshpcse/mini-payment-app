import { QueryClient } from '@tanstack/react-query';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      // Retries are decided per request by the API client, which only retries safe methods.
      queries: { retry: false, refetchOnWindowFocus: true },
      mutations: { retry: false },
    },
  });
}
