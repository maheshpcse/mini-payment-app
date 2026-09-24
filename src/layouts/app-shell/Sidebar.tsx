import { ArrowLeftRight, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router';
import { LAB_NAV, PRIMARY_NAV, type NavItem } from '../../config/navigation';
import styles from './AppShell.module.css';
import type { SidebarSide } from './useShellPreferences';

interface SidebarProps {
  collapsed: boolean;
  side: SidebarSide;
  mobileOpen: boolean;
  onToggleCollapsed(): void;
  onToggleSide(): void;
  onCloseMobile(): void;
}

function NavGroup({ title, items, collapsed, onNavigate }: { title: string; items: NavItem[]; collapsed: boolean; onNavigate(): void }) {
  return (
    <div className={styles.navGroup}>
      <p className={styles.navGroupTitle} aria-hidden={collapsed || undefined}>
        {title}
      </p>
      <ul className={styles.navList}>
        {items.map(({ id, label, path, icon: Icon, task }) => (
          <li key={id}>
            <NavLink
              to={path}
              end={path === '/'}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              title={collapsed ? label : undefined}
              aria-label={collapsed ? label : undefined}
              onClick={onNavigate}
            >
              <Icon size={19} aria-hidden="true" className={styles.navIcon} />
              <span className={styles.navLabel}>{label}</span>
              {task && !collapsed && <span className={styles.plannedTag}>Soon</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Sidebar({ collapsed, side, mobileOpen, onToggleCollapsed, onToggleSide, onCloseMobile }: SidebarProps) {
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseMobile();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen, onCloseMobile]);

  return (
    <>
      {mobileOpen && <div className={styles.scrim} onClick={onCloseMobile} aria-hidden="true" />}
      <nav
        className={styles.sidebar}
        data-collapsed={collapsed}
        data-side={side}
        data-mobile-open={mobileOpen}
        aria-label="Primary"
      >
        <div className={styles.sidebarTools}>
          <button ref={closeButton} type="button" className={`${styles.iconButton} ${styles.mobileOnly}`} onClick={onCloseMobile} aria-label="Close navigation menu">
            <X size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`${styles.iconButton} ${styles.desktopOnly}`}
            onClick={onToggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
          >
            {collapsed ? <PanelLeftOpen size={18} aria-hidden="true" /> : <PanelLeftClose size={18} aria-hidden="true" />}
          </button>
          <button
            type="button"
            className={`${styles.iconButton} ${styles.desktopOnly}`}
            onClick={onToggleSide}
            aria-label={side === 'left' ? 'Move sidebar to the right' : 'Move sidebar to the left'}
          >
            <ArrowLeftRight size={16} aria-hidden="true" />
          </button>
        </div>
        <div className={styles.sidebarScroll}>
          <NavGroup title="Payments" items={PRIMARY_NAV} collapsed={collapsed} onNavigate={onCloseMobile} />
          <NavGroup title="Developer & Architecture Lab" items={LAB_NAV} collapsed={collapsed} onNavigate={onCloseMobile} />
        </div>
      </nav>
    </>
  );
}
