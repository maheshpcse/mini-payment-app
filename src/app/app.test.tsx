import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SHELL_STORAGE_KEY } from '../layouts/app-shell/useShellPreferences';
import { renderApp } from '../test/render';

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify({ data: { status: 'ready', dependencies: [] } }), { status: 200 })),
  );
});

describe('app shell', () => {
  it('renders the home page inside the floating shell with sandbox labelling', async () => {
    renderApp('/');
    expect(screen.getByRole('heading', { level: 1, name: /effortless/i })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo', { name: 'System and support' })).toHaveTextContent('Sandbox mode · no real money');
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main-content');
    await waitFor(() => expect(screen.getAllByText('API online').length).toBeGreaterThan(0));
  });

  it('shows the API as offline when the backend is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))));
    renderApp('/');
    await waitFor(() => expect(screen.getAllByText('API offline').length).toBeGreaterThan(0), { timeout: 3000 });
  });

  it('keeps the developer lab separate from payment navigation', () => {
    renderApp('/');
    const sidebar = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(sidebar).getByText('Payments')).toBeInTheDocument();
    expect(within(sidebar).getByText('Developer & Architecture Lab')).toBeInTheDocument();
    expect(within(sidebar).getByRole('link', { name: /Relationship diagrams/ })).toBeInTheDocument();
  });

  it('marks the active route', async () => {
    renderApp('/transactions');
    const sidebar = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(sidebar).getByRole('link', { name: /Transactions/ })).toHaveAttribute('aria-current', 'page');
  });

  it('renders an honest planned page for features that are not built', () => {
    renderApp('/pay');
    expect(screen.getByRole('heading', { level: 1, name: 'Pay' })).toBeInTheDocument();
    expect(screen.getByText('Planned · FE-008')).toBeInTheDocument();
    expect(screen.getByText(/not built yet/i)).toBeInTheDocument();
  });

  it('renders the design system page', () => {
    renderApp('/lab/design-system');
    expect(screen.getByRole('heading', { level: 1, name: 'Design system' })).toBeInTheDocument();
    expect(screen.getByText('₹1,28,450.50')).toBeInTheDocument();
  });

  it('renders an original 404 for unknown routes', () => {
    renderApp('/no-such-page');
    expect(screen.getByRole('heading', { name: /off the ledger/i })).toBeInTheDocument();
  });

  it('navigates via the sidebar', async () => {
    renderApp('/');
    const sidebar = screen.getByRole('navigation', { name: 'Primary' });
    await userEvent.click(within(sidebar).getByRole('link', { name: /Rewards/ }));
    expect(screen.getByRole('heading', { level: 1, name: 'Rewards' })).toBeInTheDocument();
  });

  it('collapses the sidebar to icon-only mode and remembers it', async () => {
    const { unmount } = renderApp('/');
    const sidebar = screen.getByRole('navigation', { name: 'Primary' });
    await userEvent.click(within(sidebar).getByRole('button', { name: 'Collapse sidebar' }));

    expect(sidebar).toHaveAttribute('data-collapsed', 'true');
    expect(within(sidebar).getByRole('link', { name: 'Contacts' })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(SHELL_STORAGE_KEY)!)).toMatchObject({ collapsed: true });
    unmount();

    renderApp('/');
    expect(screen.getByRole('navigation', { name: 'Primary' })).toHaveAttribute('data-collapsed', 'true');
  });

  it('moves the sidebar to the right side', async () => {
    renderApp('/');
    const sidebar = screen.getByRole('navigation', { name: 'Primary' });
    await userEvent.click(within(sidebar).getByRole('button', { name: 'Move sidebar to the right' }));
    expect(sidebar).toHaveAttribute('data-side', 'right');
  });

  it('opens the mobile drawer and closes it with Escape', async () => {
    renderApp('/');
    const sidebar = screen.getByRole('navigation', { name: 'Primary' });
    await userEvent.click(screen.getByRole('button', { name: 'Open navigation menu' }));
    expect(sidebar).toHaveAttribute('data-mobile-open', 'true');
    expect(within(sidebar).getByRole('button', { name: 'Close navigation menu' })).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    expect(sidebar).toHaveAttribute('data-mobile-open', 'false');
  });
});
