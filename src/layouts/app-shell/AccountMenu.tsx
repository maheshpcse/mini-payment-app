import { LogOut, Settings, ShieldCheck, UserRound, WalletCards } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router';
import { apiAssetUrl } from '../../features/auth/auth-api';
import { useCurrentUser, useSignOut } from '../../features/auth/useSession';
import { Avatar } from '../../shared/ui/Avatar';
import styles from './AccountMenu.module.css';

const LINKS = [
  { to: '/profile', label: 'Profile', icon: UserRound },
  { to: '/wallets', label: 'Wallets', icon: WalletCards },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/settings/security', label: 'Security', icon: ShieldCheck },
];

/** Disclosure menu: Escape and outside clicks close it, and focus returns to the trigger. */
export function AccountMenu() {
  const user = useCurrentUser();
  const signOut = useSignOut();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={styles.root} ref={root}>
      <button
        ref={trigger}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Account menu for ${user.fullName}`}
        onClick={() => setOpen((current) => !current)}
      >
        <Avatar name={user.fullName} initials={user.initials} src={apiAssetUrl(user.avatarUrl)} decorative />
      </button>
      {open && (
        <div id={menuId} className={styles.menu}>
          <div className={styles.identity}>
            <Avatar name={user.fullName} initials={user.initials} src={apiAssetUrl(user.avatarUrl)} size="lg" decorative />
            <div className={styles.identityText}>
              <strong>{user.fullName}</strong>
              <span>{user.email}</span>
            </div>
          </div>
          <ul className={styles.list}>
            {LINKS.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <Link to={to} className={styles.item} onClick={() => setOpen(false)}>
                  <Icon size={17} aria-hidden="true" /> {label}
                </Link>
              </li>
            ))}
            <li>
              <button type="button" className={`${styles.item} ${styles.danger}`} onClick={() => void signOut()}>
                <LogOut size={17} aria-hidden="true" /> Sign out
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
