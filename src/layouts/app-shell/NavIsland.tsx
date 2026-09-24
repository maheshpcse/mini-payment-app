import { Bell, Menu, Search, Send, Wallet } from 'lucide-react';
import { Link, NavLink } from 'react-router';
import { BrandMark } from '../../shared/ui/BrandMark';
import styles from './AppShell.module.css';
import { ThemeSwitcher } from './ThemeSwitcher';

export function NavIsland({ onOpenMenu }: { onOpenMenu(): void }) {
  return (
    <header className={styles.navIsland}>
      <button type="button" className={`${styles.iconButton} ${styles.mobileOnly}`} onClick={onOpenMenu} aria-label="Open navigation menu">
        <Menu size={20} aria-hidden="true" />
      </button>
      <Link to="/" className={styles.brandLink} aria-label="MiNi Pay home">
        <BrandMark />
      </Link>

      <button type="button" className={styles.searchTrigger} aria-disabled="true" title="Search arrives with contacts and transactions (FE-007, FE-009)">
        <Search size={16} aria-hidden="true" />
        <span>Search people, payments…</span>
        <kbd className={styles.kbd}>Soon</kbd>
      </button>

      <div className={styles.navActions}>
        <NavLink to="/accounts" className={styles.balanceChip} aria-label="Sandbox wallet (balance available after sign-in)">
          <Wallet size={16} aria-hidden="true" />
          <span className={styles.balanceText}>Sandbox wallet</span>
        </NavLink>
        <ThemeSwitcher />
        <NavLink to="/notifications" className={styles.iconButton} aria-label="Notifications">
          <Bell size={18} aria-hidden="true" />
        </NavLink>
        <NavLink to="/pay" className={styles.quickPay}>
          <Send size={16} aria-hidden="true" />
          <span>Quick pay</span>
        </NavLink>
        <span className={styles.avatar} role="img" aria-label="Guest profile">
          G
        </span>
      </div>
    </header>
  );
}
