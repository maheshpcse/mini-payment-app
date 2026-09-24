import { Menu } from 'lucide-react';
import { NavLink } from 'react-router';
import { MOBILE_NAV_IDS, PRIMARY_NAV } from '../../config/navigation';
import styles from './AppShell.module.css';

const ITEMS = MOBILE_NAV_IDS.map((id) => PRIMARY_NAV.find((item) => item.id === id)!);

export function MobileNav({ onOpenMenu }: { onOpenMenu(): void }) {
  return (
    <nav className={styles.mobileNav} aria-label="Quick navigation">
      {ITEMS.map(({ id, label, path, icon: Icon }) => (
        <NavLink
          key={id}
          to={path}
          end={path === '/'}
          className={({ isActive }) => `${styles.mobileNavItem} ${id === 'scan' ? styles.mobileNavScan : ''} ${isActive ? styles.mobileNavActive : ''}`}
        >
          <Icon size={20} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
      <button type="button" className={styles.mobileNavItem} onClick={onOpenMenu}>
        <Menu size={20} aria-hidden="true" />
        <span>More</span>
      </button>
    </nav>
  );
}
