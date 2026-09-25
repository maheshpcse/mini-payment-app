import { ChevronRight, LogOut, MonitorSmartphone, Moon, PanelLeft, PencilLine, Sun, UserRound } from 'lucide-react';
import { Link } from 'react-router';
import { useTheme, type ThemePreference } from '../../core/theme/theme-context';
import { Button } from '../../shared/ui/Button';
import { Island } from '../../shared/ui/Island';
import { useSignOut } from '../auth/useSession';
import styles from '../account/Account.module.css';
import settings from './Settings.module.css';

const THEMES: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'Match device', icon: MonitorSmartphone },
];

export function GeneralSettingsPage() {
  const { preference, setPreference } = useTheme();
  const signOut = useSignOut();

  return (
    <div className={styles.grid}>
      <Island as="article" aria-labelledby="appearance-title">
        <div className={styles.cardHeader}>
          <div>
            <h2 id="appearance-title">Appearance</h2>
            <p>Saved on this device.</p>
          </div>
        </div>
        <div className={settings.themeGrid} role="radiogroup" aria-labelledby="appearance-title">
          {THEMES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={preference === value}
              className={settings.themeOption}
              data-theme-preview={value}
              onClick={() => setPreference(value)}
            >
              <span className={settings.themeSwatch} aria-hidden="true" />
              <span className={settings.themeLabel}>
                <Icon size={16} aria-hidden="true" /> {label}
              </span>
            </button>
          ))}
        </div>
        <p className={`${styles.muted} ${settings.note}`}>
          <PanelLeft size={14} aria-hidden="true" /> Sidebar side and collapse state are set from the sidebar itself.
        </p>
      </Island>

      <Island as="article" aria-labelledby="account-title">
        <div className={styles.cardHeader}>
          <h2 id="account-title">Account</h2>
        </div>
        <ul className={styles.linkList}>
          <li>
            <Link to="/profile" className={styles.linkRow}>
              <span className={styles.linkIcon} aria-hidden="true">
                <UserRound size={18} />
              </span>
              <span className={styles.linkText}>
                <strong>Profile & photo</strong>
                <span>View your profile, change or remove your photo</span>
              </span>
              <ChevronRight size={18} aria-hidden="true" />
            </Link>
          </li>
          <li>
            <Link to="/profile/edit" className={styles.linkRow}>
              <span className={styles.linkIcon} aria-hidden="true">
                <PencilLine size={18} />
              </span>
              <span className={styles.linkText}>
                <strong>Edit profile</strong>
                <span>Name and mobile number</span>
              </span>
              <ChevronRight size={18} aria-hidden="true" />
            </Link>
          </li>
        </ul>
        <div className={`${styles.formActions} ${settings.note}`}>
          <Button variant="secondary" icon={<LogOut size={18} />} onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>
      </Island>
    </div>
  );
}
