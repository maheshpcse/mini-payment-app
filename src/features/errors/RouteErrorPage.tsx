import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import styles from './ErrorPage.module.css';

/** Last-resort boundary for render/loader failures. Never shows stack traces to users. */
export function RouteErrorPage() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : 500;

  return (
    <section className={styles.page} role="alert" aria-labelledby="route-error-title">
      <p className={styles.code} aria-hidden="true">
        {status}
      </p>
      <h1 id="route-error-title">Something interrupted this screen</h1>
      <p className={styles.body}>No payment was made. Reload the page, or head back home and try again.</p>
      <div className={styles.actions}>
        <button type="button" className={styles.action} onClick={() => window.location.reload()}>
          Reload
        </button>
        <Link to="/" className={styles.secondary}>
          Go home
        </Link>
      </div>
    </section>
  );
}
