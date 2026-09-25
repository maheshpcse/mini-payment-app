import { CircleAlert, CircleCheck, Info } from 'lucide-react';
import type { ReactNode } from 'react';
import styles from './Alert.module.css';

const ICONS = { success: CircleCheck, danger: CircleAlert, info: Info, warning: CircleAlert } as const;

/** Errors interrupt (role=alert); confirmations and info are announced politely. */
export function Alert({ tone = 'info', title, children }: { tone?: keyof typeof ICONS; title?: string; children?: ReactNode }) {
  const Icon = ICONS[tone];
  return (
    <div className={`${styles.alert} ${styles[tone]}`} role={tone === 'danger' ? 'alert' : 'status'}>
      <Icon size={18} aria-hidden="true" className={styles.icon} />
      <div className={styles.body}>
        {title && <p className={styles.title}>{title}</p>}
        {children && <div className={styles.text}>{children}</div>}
      </div>
    </div>
  );
}
