import { ArrowLeftRight, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type FocusEvent, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router';
import { NAV_GROUPS, type NavItem } from '../../config/navigation';
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

interface TooltipState {
  label: string;
  planned: boolean;
  top: number;
  x: number;
  side: SidebarSide;
}

const TOOLTIP_GAP = 14;

/**
 * Label shown beside icon-only items. Rendered in a portal with fixed
 * positioning because the sidebar's scroll container clips overflow. The link
 * already carries an aria-label, so the tooltip is hidden from assistive tech.
 */
function NavTooltip({ tooltip }: { tooltip: TooltipState | null }) {
  if (!tooltip) return null;
  return createPortal(
    <div
      className={styles.navTooltip}
      data-side={tooltip.side}
      style={{ top: tooltip.top, left: tooltip.x }}
      aria-hidden="true"
      data-testid="nav-tooltip"
    >
      {tooltip.label}
      {tooltip.planned && <span className={styles.navTooltipTag}>Soon</span>}
    </div>,
    document.body,
  );
}

function NavGroup({
  title,
  items,
  collapsed,
  onNavigate,
  onShowTooltip,
  onHideTooltip,
}: {
  title: string;
  items: NavItem[];
  collapsed: boolean;
  onNavigate(): void;
  onShowTooltip(event: MouseEvent<HTMLElement> | FocusEvent<HTMLElement>, item: NavItem): void;
  onHideTooltip(): void;
}) {
  return (
    <div className={styles.navGroup}>
      <p className={styles.navGroupTitle} aria-hidden={collapsed || undefined}>
        {title}
      </p>
      <ul className={styles.navList}>
        {items.map((item) => {
          const { id, label, path, icon: Icon, task, end } = item;
          return (
            <li key={id}>
              <NavLink
                to={path}
                end={end}
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                aria-label={collapsed ? label : undefined}
                onClick={() => {
                  onHideTooltip();
                  onNavigate();
                }}
                onMouseEnter={(event) => onShowTooltip(event, item)}
                onMouseLeave={onHideTooltip}
                onFocus={(event) => onShowTooltip(event, item)}
                onBlur={onHideTooltip}
              >
                <Icon size={19} aria-hidden="true" className={styles.navIcon} />
                <span className={styles.navLabel}>{label}</span>
                {task && !collapsed && <span className={styles.plannedTag}>Soon</span>}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Sidebar({ collapsed, side, mobileOpen, onToggleCollapsed, onToggleSide, onCloseMobile }: SidebarProps) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseMobile();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen, onCloseMobile]);

  const hideTooltip = useCallback(() => setTooltip(null), []);

  const showTooltip = useCallback(
    (event: MouseEvent<HTMLElement> | FocusEvent<HTMLElement>, item: NavItem) => {
      // Only the collapsed desktop rail needs labels; the mobile drawer always shows them.
      if (!collapsed || mobileOpen || !navRef.current) return;
      if (event.type === 'focus' && !event.currentTarget.matches(':focus-visible')) return;
      const itemRect = event.currentTarget.getBoundingClientRect();
      const railRect = navRef.current.getBoundingClientRect();
      setTooltip({
        label: item.label,
        planned: Boolean(item.task),
        top: itemRect.top + itemRect.height / 2,
        x: side === 'left' ? railRect.right + TOOLTIP_GAP : railRect.left - TOOLTIP_GAP,
        side,
      });
    },
    [collapsed, mobileOpen, side],
  );

  return (
    <>
      {mobileOpen && <div className={styles.scrim} onClick={onCloseMobile} aria-hidden="true" />}
      <nav
        ref={navRef}
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
        <div className={styles.sidebarScroll} onScroll={hideTooltip}>
          {NAV_GROUPS.map((group) => (
            <NavGroup
              key={group.title}
              title={group.title}
              items={group.items}
              collapsed={collapsed}
              onNavigate={onCloseMobile}
              onShowTooltip={showTooltip}
              onHideTooltip={hideTooltip}
            />
          ))}
        </div>
      </nav>
      <NavTooltip tooltip={collapsed && !mobileOpen ? tooltip : null} />
    </>
  );
}
