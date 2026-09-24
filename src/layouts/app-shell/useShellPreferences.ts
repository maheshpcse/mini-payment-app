import { useCallback, useState } from 'react';

export type SidebarSide = 'left' | 'right';

export interface ShellPreferences {
  collapsed: boolean;
  side: SidebarSide;
}

export const SHELL_STORAGE_KEY = 'mini-pay.shell';
const DEFAULTS: ShellPreferences = { collapsed: false, side: 'left' };

function read(): ShellPreferences {
  try {
    const parsed = JSON.parse(localStorage.getItem(SHELL_STORAGE_KEY) ?? '{}') as Partial<ShellPreferences>;
    return {
      collapsed: typeof parsed.collapsed === 'boolean' ? parsed.collapsed : DEFAULTS.collapsed,
      side: parsed.side === 'right' ? 'right' : 'left',
    };
  } catch {
    return DEFAULTS;
  }
}

/** UI-only layout preferences; kept out of server/auth/payment state by design. */
export function useShellPreferences() {
  const [prefs, setPrefs] = useState<ShellPreferences>(read);

  const update = useCallback((patch: Partial<ShellPreferences>) => {
    setPrefs((current) => {
      const next = { ...current, ...patch };
      try {
        localStorage.setItem(SHELL_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Non-persistent fallback when storage is unavailable.
      }
      return next;
    });
  }, []);

  return {
    ...prefs,
    toggleCollapsed: () => update({ collapsed: !prefs.collapsed }),
    toggleSide: () => update({ side: prefs.side === 'left' ? 'right' : 'left' }),
  };
}
