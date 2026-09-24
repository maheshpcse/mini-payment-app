import { ArrowDownLeft, Landmark, ScanLine, Send, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { PRIMARY_NAV } from '../../config/navigation';
import { Island } from '../../shared/ui/Island';
import { StatusPill } from '../../shared/ui/StatusPill';
import { SystemStatusIndicator } from '../system-status/SystemStatusIndicator';
import styles from './HomePage.module.css';

const QUICK_ACTIONS = [
  { label: 'Send', to: '/pay', icon: Send, tone: styles.actionPrimary },
  { label: 'Request', to: '/pay', icon: ArrowDownLeft, tone: styles.actionSecondary },
  { label: 'Scan & Pay', to: '/scan', icon: ScanLine, tone: styles.actionAccent },
  { label: 'Bills', to: '/bills', icon: Landmark, tone: styles.actionNeutral },
];

export function HomePage() {
  const upcoming = PRIMARY_NAV.filter((item) => item.task);

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={styles.heroCopy}>
          <StatusPill tone="accent">Sandbox · demo money only</StatusPill>
          <h1 id="home-title">
            Payments that feel <em>effortless</em>,<br /> engineered like they matter.
          </h1>
          <p className={styles.lead}>
            MiNi Pay is a sandbox payment experience. Nothing here moves real money, touches a bank or processes a card. Features
            switch on as each backend capability ships.
          </p>
        </div>

        <Island tone="signature" className={styles.balanceIsland} aria-label="Sandbox wallet">
          <div className={styles.orb} aria-hidden="true" />
          <p className={styles.balanceLabel}>Sandbox wallet</p>
          <p className={styles.balancePending}>Sign in to see your sandbox balance</p>
          <p className={styles.balanceHint}>Wallet and ledger arrive with FE-006 / BE-010.</p>
        </Island>
      </section>

      <nav aria-label="Quick actions" className={styles.actions}>
        {QUICK_ACTIONS.map(({ label, to, icon: Icon, tone }) => (
          <Link key={label} to={to} className={`${styles.action} ${tone}`}>
            <span className={styles.actionIcon}>
              <Icon size={22} aria-hidden="true" />
            </span>
            <span className={styles.actionLabel}>{label}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.grid}>
        <Island as="article" aria-labelledby="status-title">
          <div className={styles.cardHeader}>
            <ShieldCheck size={20} aria-hidden="true" />
            <h2 id="status-title">Platform status</h2>
          </div>
          <p className={styles.cardBody}>Live readiness of the sandbox API, MongoDB and Redis, refreshed every 30 seconds.</p>
          <SystemStatusIndicator />
        </Island>

        <Island as="article" shape="island-alt" aria-labelledby="roadmap-title">
          <div className={styles.cardHeader}>
            <Sparkles size={20} aria-hidden="true" />
            <h2 id="roadmap-title">Coming next</h2>
          </div>
          <ul className={styles.roadmap}>
            {upcoming.slice(0, 6).map((item) => (
              <li key={item.id}>
                <Link to={item.path}>{item.label}</Link>
                <span className="mono">{item.task}</span>
              </li>
            ))}
          </ul>
        </Island>
      </div>
    </div>
  );
}
