import { useQuery } from '@tanstack/react-query';
import { apiClient, type ApiClient } from '../../api/client';

export interface DependencyStatus {
  name: string;
  status: 'up' | 'down';
  latencyMs: number;
}

interface ReadinessResponse {
  status: 'ready' | 'not_ready';
  dependencies: DependencyStatus[];
}

export type SystemState = 'checking' | 'online' | 'degraded' | 'offline';

export interface SystemHealth {
  state: SystemState;
  dependencies: DependencyStatus[];
  requestId?: string;
}

export const SYSTEM_HEALTH_QUERY_KEY = ['system', 'readiness'] as const;

export async function fetchSystemHealth(client: ApiClient, signal?: AbortSignal): Promise<SystemHealth> {
  try {
    const response = await client.request<ReadinessResponse>('/health/ready', {
      signal,
      timeoutMs: 5_000,
      retries: 1,
      acceptStatuses: [503],
    });
    return {
      state: response.data.status === 'ready' ? 'online' : 'degraded',
      dependencies: response.data.dependencies ?? [],
      requestId: response.requestId,
    };
  } catch {
    return { state: 'offline', dependencies: [] };
  }
}

export function useSystemHealth(client: ApiClient = apiClient): SystemHealth {
  const query = useQuery({
    queryKey: SYSTEM_HEALTH_QUERY_KEY,
    queryFn: ({ signal }) => fetchSystemHealth(client, signal),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
  return query.data ?? { state: 'checking', dependencies: [] };
}
