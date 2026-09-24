import type { ReactNode } from 'react';
import styles from './StatusPill.module.css';

export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'accent';

/** Status is always conveyed by text; the dot color is supplementary. */
export function StatusPill({ tone = 'neutral', children, pulse = false }: { tone?: StatusTone; children: ReactNode; pulse?: boolean }) {
  return (
    <span className={`${styles.pill} ${styles[tone]}`}>
      <span className={`${styles.dot} ${pulse ? styles.pulse : ''}`} aria-hidden="true" />
      {children}
    </span>
  );
}
