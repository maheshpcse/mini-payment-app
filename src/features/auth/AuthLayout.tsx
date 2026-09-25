import { ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';
import { Link, Navigate, Outlet, useLocation, useSearchParams } from 'react-router';
import { BrandMark } from '../../shared/ui/BrandMark';
import { ThemeSwitcher } from '../../layouts/app-shell/ThemeSwitcher';
import { AuthScene } from './AuthScene';
import styles from './AuthLayout.module.css';
import { safeNextPath } from './redirect';
import { sessionStore } from './session-store';
import { SessionSplash } from './SessionSplash';
import { useSession } from './useSession';

/** Pages a signed-in user may still open (e.g. following a reset link from email). */
const OPEN_WHEN_SIGNED_IN = new Set(['/reset-password']);

export function AuthLayout() {
  const { status } = useSession();
  const location = useLocation();
  const [params] = useSearchParams();

  useEffect(() => sessionStore.bootstrap(), []);

  if (status === 'unknown') return <SessionSplash />;
  if (status === 'authenticated' && !OPEN_WHEN_SIGNED_IN.has(location.pathname)) {
    return <Navigate to={safeNextPath(params.get('next'))} replace />;
  }

  return (
    <div className={styles.page}>
      <aside className={styles.showcase}>
        <AuthScene />
        <div className={styles.showcaseCopy}>
          <p className={styles.eyebrow}>Sandbox payments · no real money</p>
          <h2 className={styles.showcaseTitle}>
            Send, scan and settle
            <br />
            in a single tap.
          </h2>
          <p className={styles.showcaseText}>Wallets, bank accounts and UPI IDs in one calm place, engineered like the real thing.</p>
        </div>
      </aside>

      <div className={styles.panel}>
        <header className={styles.panelHeader}>
          <Link to="/welcome" className={styles.brand} aria-label="MiNi Pay home">
            <BrandMark />
          </Link>
          <ThemeSwitcher />
        </header>
        <main className={styles.formArea} id="main-content">
          <div key={location.pathname} className={styles.formCard}>
            <Outlet />
          </div>
        </main>
        <footer className={styles.panelFooter}>
          <ShieldCheck size={14} aria-hidden="true" />
          <span>Demo environment. Never enter real bank, card or UPI credentials.</span>
        </footer>
      </div>
    </div>
  );
}
