import { BrandMark } from '../../shared/ui/BrandMark';
import styles from './AuthLayout.module.css';

export function SessionSplash() {
  return (
    <div className={styles.splash} role="status" aria-live="polite">
      <BrandMark />
      <span className={styles.splashBar} aria-hidden="true" />
      <span className="visually-hidden">Restoring your session…</span>
    </div>
  );
}
