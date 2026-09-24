import { MonitorSmartphone, Moon, Sun } from 'lucide-react';
import { useTheme, type ThemePreference } from '../../core/theme/theme-context';
import styles from './AppShell.module.css';

const OPTIONS: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: MonitorSmartphone },
];

export function ThemeSwitcher() {
  const { preference, setPreference } = useTheme();
  return (
    <div className={styles.segmented} role="radiogroup" aria-label="Color theme">
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={preference === value}
          aria-label={`${label} theme`}
          title={`${label} theme`}
          className={styles.segment}
          onClick={() => setPreference(value)}
        >
          <Icon size={16} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
