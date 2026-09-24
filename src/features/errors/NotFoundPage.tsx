import { Link } from 'react-router';
import styles from './ErrorPage.module.css';

export function NotFoundPage() {
  return (
    <section className={styles.page} aria-labelledby="not-found-title">
      <p className={styles.code} aria-hidden="true">
        4<span>0</span>4
      </p>
      <h1 id="not-found-title">This route went off the ledger</h1>
      <p className={styles.body}>The page you asked for doesn’t exist. Nothing was charged; let’s get you somewhere useful.</p>
      <Link to="/" className={styles.action}>
        Return home
      </Link>
    </section>
  );
}
