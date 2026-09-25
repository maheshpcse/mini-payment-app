import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { grantFor, mockApi, TEST_USER } from '../../test/api-mock';
import { renderApp } from '../../test/render';

describe('landing page', () => {
  it('is where signed-out visitors to the site root arrive', async () => {
    mockApi();
    const { router } = renderApp('/', { user: null });
    expect(await screen.findByRole('heading', { level: 1, name: /Payments that feel instant/ })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/welcome');
    const header = screen.getByRole('banner');
    expect(within(header).getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');
    expect(within(header).getByRole('link', { name: 'Get started' })).toHaveAttribute('href', '/signup');
  });

  it('marks which features are live and which are coming', async () => {
    mockApi();
    renderApp('/welcome', { user: null });
    const features = within(await screen.findByRole('region', { name: 'Everything a daily payment app does' }));
    const card = (name: string) => features.getByRole('heading', { name }).closest('li')!;
    expect(within(card('Wallets')).getByText('Live')).toBeInTheDocument();
    expect(within(card('Pay')).getByText('Coming soon')).toBeInTheDocument();
  });

  it('opens the demo account from the hero', async () => {
    const api = mockApi({ 'POST /auth/login': { body: { data: grantFor({ ...TEST_USER, isDemo: true }) } } });
    const { router } = renderApp('/welcome', { user: null });
    await userEvent.click(await screen.findByRole('button', { name: 'Try the live demo' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
    expect(api.callsTo('POST /auth/login')[0]?.body).toEqual({ email: 'demo@example.com', password: 'MiniPay@2026' });
    expect(await screen.findByText(/Hi Asha/)).toBeInTheDocument();
  });

  it('offers to open the app instead of signing in when a session exists', async () => {
    mockApi();
    renderApp('/welcome');
    expect(await screen.findByRole('link', { name: 'Open MiNi Pay' })).toHaveAttribute('href', '/');
    expect(screen.queryByRole('button', { name: 'Try the live demo' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'See it with data already in place' })).not.toBeInTheDocument();
  });
});
