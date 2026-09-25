import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SHELL_STORAGE_KEY } from '../layouts/app-shell/useShellPreferences';
import { grantFor, mockApi, TEST_USER } from '../test/api-mock';
import { renderApp } from '../test/render';

beforeEach(() => {
  mockApi();
});

describe('app shell', () => {
  it('renders the home page inside the floating shell with sandbox labelling', async () => {
    renderApp('/');
    expect(screen.getByRole('heading', { level: 1, name: /effortless/i })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo', { name: 'System and support' })).toHaveTextContent('Sandbox mode · no real money');
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main-content');
    expect(screen.getByText(/Hi Asha/)).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByText('API online').length).toBeGreaterThan(0));
  });

  it('shows the API as offline when the backend is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))));
    renderApp('/');
    await waitFor(() => expect(screen.getAllByText('API offline').length).toBeGreaterThan(0), { timeout: 3000 });
  });

  it('groups payment and account navigation with no developer lab', () => {
    renderApp('/');
    const sidebar = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(sidebar).getByText('Payments')).toBeInTheDocument();
    expect(within(sidebar).getByText('Account')).toBeInTheDocument();
    expect(within(sidebar).getByRole('link', { name: /Wallets/ })).toHaveAttribute('href', '/wallets');
    expect(within(sidebar).getByRole('link', { name: /Profile/ })).toHaveAttribute('href', '/profile');
    expect(screen.queryByText(/Developer & Architecture Lab/)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Relationship diagrams|Design system/ })).not.toBeInTheDocument();
  });

  it('marks only the most specific settings route as active', () => {
    renderApp('/settings/security');
    const sidebar = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(sidebar).getByRole('link', { name: /Security/ })).toHaveAttribute('aria-current', 'page');
    expect(within(sidebar).getByRole('link', { name: /^Settings/ })).not.toHaveAttribute('aria-current');
  });

  it('marks the active route', () => {
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

  it('no longer serves the developer lab routes', () => {
    renderApp('/lab/design-system');
    expect(screen.getByRole('heading', { name: /off the ledger/i })).toBeInTheDocument();
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

  it('shows a tooltip beside collapsed items on hover only', async () => {
    renderApp('/');
    const sidebar = screen.getByRole('navigation', { name: 'Primary' });

    await userEvent.hover(within(sidebar).getByRole('link', { name: /Contacts/ }));
    expect(screen.queryByTestId('nav-tooltip')).not.toBeInTheDocument();

    await userEvent.click(within(sidebar).getByRole('button', { name: 'Collapse sidebar' }));
    await userEvent.hover(within(sidebar).getByRole('link', { name: 'Contacts' }));
    const tooltip = screen.getByTestId('nav-tooltip');
    expect(tooltip).toHaveTextContent('ContactsSoon');
    expect(tooltip).toHaveAttribute('data-side', 'left');

    await userEvent.unhover(within(sidebar).getByRole('link', { name: 'Contacts' }));
    expect(screen.queryByTestId('nav-tooltip')).not.toBeInTheDocument();

    await userEvent.hover(within(sidebar).getByRole('link', { name: 'Wallets' }));
    expect(screen.getByTestId('nav-tooltip')).toHaveTextContent(/^Wallets$/);
  });

  it('flips the tooltip when the sidebar is on the right', async () => {
    renderApp('/');
    const sidebar = screen.getByRole('navigation', { name: 'Primary' });
    await userEvent.click(within(sidebar).getByRole('button', { name: 'Move sidebar to the right' }));
    await userEvent.click(within(sidebar).getByRole('button', { name: 'Collapse sidebar' }));
    await userEvent.hover(within(sidebar).getByRole('link', { name: 'Home' }));
    expect(screen.getByTestId('nav-tooltip')).toHaveAttribute('data-side', 'right');
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

describe('session gate', () => {
  it('sends signed-out visitors to sign in and remembers where they were going', async () => {
    const { router } = renderApp('/wallets', { user: null });
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
    expect(router.state.location.search).toBe('?next=%2Fwallets');
    expect(screen.getByText('Please sign in to continue.')).toBeInTheDocument();
    expect(screen.getByTestId('auth-scene')).toBeInTheDocument();
  });

  it('restores a session from the refresh cookie on load', async () => {
    const api = mockApi({ 'POST /auth/refresh': { body: { data: grantFor(TEST_USER) } } });
    renderApp('/', { user: null });
    expect(await screen.findByText(/Hi Asha/)).toBeInTheDocument();
    expect(api.callsTo('POST /auth/refresh')).toHaveLength(1);
    await waitFor(() => expect(api.callsTo('GET /wallets/me')[0]?.headers.get('Authorization')).toBe('Bearer access-token'));
  });

  it('opens the account menu from the avatar and signs out', async () => {
    const api = mockApi();
    const { router } = renderApp('/');
    await userEvent.click(screen.getByRole('button', { name: /account menu/i }));
    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(await screen.findByText('You have signed out.')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
    expect(api.callsTo('POST /auth/logout')).toHaveLength(1);
  });
});
