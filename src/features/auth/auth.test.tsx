import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { grantFor, mockApi, TEST_USER } from '../../test/api-mock';
import { renderApp } from '../../test/render';
import { safeNextPath } from './redirect';

const TOKEN = 'a'.repeat(43);

describe('sign in', () => {
  it('signs in and continues to the page that was requested', async () => {
    const api = mockApi({ 'POST /auth/login': { body: { data: grantFor() } } });
    const { router } = renderApp('/login?next=%2Fwallets', { user: null });

    await userEvent.type(await screen.findByLabelText('Email'), ' asha@example.com ');
    await userEvent.type(screen.getByLabelText('Password'), 'correct horse battery');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Wallets' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/wallets');
    expect(api.callsTo('POST /auth/login')[0]?.body).toEqual({ email: 'asha@example.com', password: 'correct horse battery' });
  });

  it('shows the server message when credentials are wrong', async () => {
    mockApi({
      'POST /auth/login': { status: 401, body: { error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'Email or password is incorrect.', requestId: 'r' } } },
    });
    renderApp('/login', { user: null });
    await userEvent.type(await screen.findByLabelText('Email'), 'asha@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrong password');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Email or password is incorrect.')).toBeInTheDocument();
  });

  it('validates before calling the API', async () => {
    const api = mockApi();
    renderApp('/login', { user: null });
    await userEvent.click(await screen.findByRole('button', { name: 'Sign in' }));
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(api.callsTo('POST /auth/login')).toHaveLength(0);
  });

  it('signs in with a demo account in one click', async () => {
    const demoUser = { ...TEST_USER, email: 'demo@example.com', firstName: 'Priya', fullName: 'Priya Sharma', isDemo: true };
    const api = mockApi({ 'POST /auth/login': { body: { data: grantFor(demoUser) } } });
    const { router } = renderApp('/login', { user: null });

    expect(await screen.findByRole('heading', { name: 'Try a demo account' })).toBeInTheDocument();
    expect(screen.getByText('MiniPay@2026')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Sign in as Priya Sharma/ }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
    expect(api.callsTo('POST /auth/login')[0]?.body).toEqual({ email: 'demo@example.com', password: 'MiniPay@2026' });
  });

  it('toggles password visibility', async () => {
    mockApi();
    renderApp('/login', { user: null });
    const field = await screen.findByLabelText('Password');
    expect(field).toHaveAttribute('type', 'password');
    await userEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(field).toHaveAttribute('type', 'text');
  });
});

describe('sign up', () => {
  it('flags every invalid field and requires the sandbox acknowledgement', async () => {
    const api = mockApi();
    renderApp('/signup', { user: null });
    await userEvent.type(await screen.findByLabelText('Email'), 'not-an-email');
    await userEvent.type(screen.getByLabelText('Password'), 'short');
    await userEvent.type(screen.getByLabelText('Confirm password'), 'different');
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(screen.getByText('Please confirm you understand this is a sandbox')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(api.callsTo('POST /auth/register')).toHaveLength(0);
  });

  it('creates the account and lands on home signed in', async () => {
    const newUser = { ...TEST_USER, firstName: 'Ravi', lastName: 'Kumar', fullName: 'Ravi Kumar', initials: 'RK', email: 'ravi@example.com' };
    const api = mockApi({ 'POST /auth/register': { status: 201, body: { data: grantFor(newUser) } } });
    renderApp('/signup', { user: null });

    await userEvent.type(await screen.findByLabelText('First name'), 'Ravi');
    await userEvent.type(screen.getByLabelText('Last name'), 'Kumar');
    await userEvent.type(screen.getByLabelText('Email'), 'ravi@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'mango lassi summer');
    await userEvent.type(screen.getByLabelText('Confirm password'), 'mango lassi summer');
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText(/Hi Ravi/)).toBeInTheDocument();
    expect(api.callsTo('POST /auth/register')[0]?.body).toEqual({ firstName: 'Ravi', lastName: 'Kumar', email: 'ravi@example.com', password: 'mango lassi summer' });
    expect(screen.getByRole('button', { name: 'Account menu for Ravi Kumar' })).toHaveTextContent('RK');
  });
});

describe('password recovery', () => {
  it('confirms the request and shows the sandbox reset link when the API returns one', async () => {
    mockApi({ 'POST /auth/password/forgot': { status: 202, body: { data: { sandboxResetToken: TOKEN } } } });
    renderApp('/forgot-password', { user: null });
    await userEvent.type(await screen.findByLabelText('Email'), 'asha@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Send reset link' }));

    expect(await screen.findByRole('heading', { name: 'Check your email' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open reset link/ })).toHaveAttribute('href', `/reset-password?token=${TOKEN}`);
  });

  it('rejects a malformed reset link without calling the API', async () => {
    const api = mockApi();
    renderApp('/reset-password?token=nope', { user: null });
    expect(await screen.findByRole('heading', { name: 'Link expired' })).toBeInTheDocument();
    expect(api.callsTo('POST /auth/password/reset')).toHaveLength(0);
  });

  it('resets the password and returns to sign in', async () => {
    const api = mockApi({ 'POST /auth/password/reset': { status: 204 } });
    const { router } = renderApp(`/reset-password?token=${TOKEN}`, { user: null });
    await userEvent.type(await screen.findByLabelText('New password'), 'a brand new phrase');
    await userEvent.type(screen.getByLabelText('Confirm new password'), 'a brand new phrase');
    await userEvent.click(screen.getByRole('button', { name: 'Update password' }));

    expect(await screen.findByText('Password updated')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
    expect(api.callsTo('POST /auth/password/reset')[0]?.body).toEqual({ token: TOKEN, password: 'a brand new phrase' });
  });

  it('shows the expired state when the server rejects the token', async () => {
    mockApi({
      'POST /auth/password/reset': { status: 400, body: { error: { code: 'AUTH_RESET_TOKEN_INVALID', message: 'This reset link is invalid or has expired.', requestId: 'r' } } },
    });
    renderApp(`/reset-password?token=${TOKEN}`, { user: null });
    await userEvent.type(await screen.findByLabelText('New password'), 'a brand new phrase');
    await userEvent.type(screen.getByLabelText('Confirm new password'), 'a brand new phrase');
    await userEvent.click(screen.getByRole('button', { name: 'Update password' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Link expired' })).toBeInTheDocument());
  });
});

describe('safeNextPath', () => {
  it.each([
    [null, '/'],
    ['/wallets', '/wallets'],
    ['/settings/security?tab=1', '/settings/security?tab=1'],
    ['https://evil.example', '/'],
    ['//evil.example', '/'],
    ['/\\evil.example', '/'],
    ['/login', '/'],
    ['/signup?next=/x', '/'],
  ])('%s -> %s', (input, expected) => {
    expect(safeNextPath(input)).toBe(expected);
  });
});
