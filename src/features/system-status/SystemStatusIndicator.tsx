import { StatusPill, type StatusTone } from '../../shared/ui/StatusPill';
import { useSystemHealth, type SystemState } from './useSystemHealth';

const PRESENTATION: Record<SystemState, { tone: StatusTone; label: string }> = {
  checking: { tone: 'neutral', label: 'Checking API' },
  online: { tone: 'success', label: 'API online' },
  degraded: { tone: 'warning', label: 'API degraded' },
  offline: { tone: 'danger', label: 'API offline' },
};

export function SystemStatusIndicator() {
  const health = useSystemHealth();
  const { tone, label } = PRESENTATION[health.state];
  const down = health.dependencies.filter((dependency) => dependency.status === 'down').map((dependency) => dependency.name);

  return (
    <span role="status" aria-live="polite" title={down.length ? `Unavailable: ${down.join(', ')}` : undefined}>
      <StatusPill tone={tone} pulse={health.state === 'online'}>
        {label}
      </StatusPill>
    </span>
  );
}
