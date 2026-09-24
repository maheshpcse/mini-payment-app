import { Compass } from 'lucide-react';
import { Link } from 'react-router';
import type { NavItem } from '../../config/navigation';
import { Island } from '../../shared/ui/Island';
import { StatusPill } from '../../shared/ui/StatusPill';
import styles from './PlannedFeaturePage.module.css';

/**
 * Honest placeholder for navigation targets whose feature has not been built.
 * It must never show fabricated balances, transactions or success states.
 */
export function PlannedFeaturePage({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <div className={styles.page}>
      <Island tone="glass" className={styles.panel} aria-labelledby="planned-title">
        <span className={styles.icon} aria-hidden="true">
          <Icon size={30} />
        </span>
        <StatusPill tone="info">Planned · {item.task}</StatusPill>
        <h1 id="planned-title">{item.label}</h1>
        <p className={styles.description}>{item.description}</p>
        <p className={styles.note}>
          This area is not built yet. It is tracked as <span className="mono">{item.task}</span> in TASKS.md and will only be marked
          done once its acceptance checks pass.
        </p>
        <Link to="/" className={styles.back}>
          <Compass size={16} aria-hidden="true" /> Back to home
        </Link>
      </Island>
    </div>
  );
}
