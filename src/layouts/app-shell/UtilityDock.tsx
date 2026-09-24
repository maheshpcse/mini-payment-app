import { BookOpen, LifeBuoy, Lock } from 'lucide-react';
import { appConfig } from '../../config/env';
import { SystemStatusIndicator } from '../../features/system-status/SystemStatusIndicator';
import { StatusPill } from '../../shared/ui/StatusPill';
import styles from './AppShell.module.css';

/** Floating utility dock that replaces a traditional footer. */
export function UtilityDock() {
  return (
    <footer className={styles.dock} aria-label="System and support">
      <StatusPill tone="accent">Sandbox mode · no real money</StatusPill>
      <SystemStatusIndicator />
      <span className={styles.dockMeta}>
        <span className="visually-hidden">Environment </span>
        <span className="mono">{appConfig.appEnv}</span>
        <span aria-hidden="true"> · </span>
        <span className="visually-hidden">Version </span>
        <span className="mono">v{appConfig.version}</span>
      </span>
      <span className={styles.dockLinks}>
        <a href="https://github.com/maheshpcse/mini-payment-app/blob/main/docs/SECURITY.md" target="_blank" rel="noreferrer">
          <Lock size={14} aria-hidden="true" /> Privacy &amp; security
        </a>
        <a href="https://github.com/maheshpcse/mini-payment-app#readme" target="_blank" rel="noreferrer">
          <BookOpen size={14} aria-hidden="true" /> Docs
        </a>
        <a href="https://github.com/maheshpcse/mini-payment-app/issues" target="_blank" rel="noreferrer">
          <LifeBuoy size={14} aria-hidden="true" /> Support
        </a>
      </span>
    </footer>
  );
}
