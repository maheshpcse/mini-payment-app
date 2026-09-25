import { LoaderCircle } from 'lucide-react';
import styles from './PageLoading.module.css';

export function PageLoading({ label }: { label: string }) {
  return (
    <div className={styles.loading} role="status">
      <LoaderCircle size={22} className={styles.spinner} aria-hidden="true" />
      <span>{label}…</span>
    </div>
  );
}
