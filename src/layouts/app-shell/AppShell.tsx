import { useCallback, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import styles from './AppShell.module.css';
import { MobileNav } from './MobileNav';
import { NavIsland } from './NavIsland';
import { Sidebar } from './Sidebar';
import { UtilityDock } from './UtilityDock';
import { useShellPreferences } from './useShellPreferences';

export function AppShell() {
  const { collapsed, side, toggleCollapsed, toggleSide } = useShellPreferences();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const openMobile = useCallback(() => setMobileOpen(true), []);
  const firstRender = useRef(true);

  // Move focus to the new page on client-side navigation so screen readers announce it.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    document.getElementById('main-content')?.focus({ preventScroll: true });
    window.scrollTo?.({ top: 0 });
  }, [location.pathname]);

  return (
    <div className={styles.shell} data-collapsed={collapsed} data-side={side}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>
      <NavIsland onOpenMenu={openMobile} />
      <Sidebar
        collapsed={collapsed}
        side={side}
        mobileOpen={mobileOpen}
        onToggleCollapsed={toggleCollapsed}
        onToggleSide={toggleSide}
        onCloseMobile={closeMobile}
      />
      <main id="main-content" className={styles.main} tabIndex={-1}>
        <div key={location.pathname} className={styles.routeTransition}>
          <Outlet />
        </div>
      </main>
      <UtilityDock />
      <MobileNav onOpenMenu={openMobile} />
    </div>
  );
}
