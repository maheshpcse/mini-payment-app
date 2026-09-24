import { BellRing, Settings2, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { NavLink, Outlet } from 'react-router';
import styles from '../account/Account.module.css';

const TABS = [
  { to: '/settings', label: 'General', icon: Settings2, end: true },
  { to: '/settings/notifications', label: 'Notifications', icon: BellRing },
  { to: '/settings/payments', label: 'Payments', icon: SlidersHorizontal },
  { to: '/settings/security', label: 'Security', icon: ShieldCheck },
];

export function SettingsLayout() {
  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h1>Settings</h1>
          <p>Control alerts, payment limits, security and how MiNi Pay looks.</p>
        </div>
      </header>
      <nav className={styles.tabs} aria-label="Settings sections">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`}>
            <Icon size={16} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
