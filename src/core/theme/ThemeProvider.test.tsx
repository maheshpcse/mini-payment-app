import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ThemeSwitcher } from '../../layouts/app-shell/ThemeSwitcher';
import { THEME_STORAGE_KEY, ThemeProvider } from './ThemeProvider';

function renderSwitcher() {
  return render(
    <ThemeProvider>
      <ThemeSwitcher />
    </ThemeProvider>,
  );
}

describe('ThemeProvider', () => {
  it('follows the system theme by default', () => {
    renderSwitcher();
    expect(screen.getByRole('radio', { name: 'System theme' })).toHaveAttribute('aria-checked', 'true');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('applies and persists an explicit choice', async () => {
    renderSwitcher();
    await userEvent.click(screen.getByRole('radio', { name: 'Dark theme' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(screen.getByRole('radio', { name: 'Dark theme' })).toHaveAttribute('aria-checked', 'true');
  });

  it('restores a saved preference and ignores invalid values', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    const { unmount } = renderSwitcher();
    expect(document.documentElement.dataset.theme).toBe('dark');
    unmount();

    localStorage.setItem(THEME_STORAGE_KEY, 'neon');
    renderSwitcher();
    expect(screen.getByRole('radio', { name: 'System theme' })).toHaveAttribute('aria-checked', 'true');
  });
});
