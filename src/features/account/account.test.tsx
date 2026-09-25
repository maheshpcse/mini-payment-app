import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Avatar } from '../../shared/ui/Avatar';
import { mockApi, TEST_PREFERENCES, TEST_USER, TEST_WALLET } from '../../test/api-mock';
import { renderApp } from '../../test/render';
import type { PaymentMethod } from './account-api';

const UPI_METHOD: PaymentMethod = {
  id: 'pm_0123456789abcdef0123',
  type: 'UPI_ID',
  label: null,
  isDefault: true,
  verifiedAt: '2026-01-15T10:00:00.000Z',
  createdAt: '2026-01-15T10:00:00.000Z',
  bank: null,
  upi: { vpa: 'asha@okhdfcbank' },
};

describe('avatar', () => {
  it('falls back to initials when there is no photo', () => {
    render(<Avatar name="Asha Verma" initials="AV" src={null} />);
    expect(screen.getByTestId('avatar-initials')).toHaveTextContent('AV');
  });

  it('falls back to initials when the photo fails to load', async () => {
    const { container } = render(<Avatar name="Asha Verma" initials="AV" src="https://api.example/avatars/missing" />);
    expect(screen.getByRole('img', { name: 'Asha Verma' })).toBeInTheDocument();
    expect(screen.queryByTestId('avatar-initials')).not.toBeInTheDocument();
    fireEvent.error(container.querySelector('img')!);
    await waitFor(() => expect(screen.getByTestId('avatar-initials')).toHaveTextContent('AV'));
  });
});

describe('profile', () => {
  it('shows the account details with initials in place of a photo', async () => {
    mockApi();
    renderApp('/profile');
    expect(screen.getByRole('heading', { level: 1, name: 'Profile' })).toBeInTheDocument();
    const summary = screen.getByRole('region', { name: 'Profile summary' });
    expect(within(summary).getByText('Asha Verma')).toBeInTheDocument();
    expect(within(summary).getAllByTestId('avatar-initials')[0]).toHaveTextContent('AV');
    expect(screen.getAllByText('asha@example.com').length).toBeGreaterThan(0);
  });

  it('edits the name and phone and updates the session user', async () => {
    const updated = { ...TEST_USER, firstName: 'Asha', lastName: 'Rao', fullName: 'Asha Rao', initials: 'AR', phone: '+919876543210' };
    const api = mockApi({ 'PATCH /users/me': { body: { data: updated } } });
    const { router } = renderApp('/profile/edit');

    const lastName = screen.getByLabelText('Last name');
    await userEvent.clear(lastName);
    await userEvent.type(lastName, 'Rao');
    expect(screen.getAllByText('AR').length).toBeGreaterThan(0);
    await userEvent.type(screen.getByLabelText('Mobile number'), '9876543210');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/profile'));
    expect(api.callsTo('PATCH /users/me')[0]?.body).toEqual({ firstName: 'Asha', lastName: 'Rao', phone: '9876543210' });
    expect(await screen.findByText('Profile updated.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Account menu for Asha Rao' })).toBeInTheDocument();
  });

  it('keeps email read-only', () => {
    mockApi();
    renderApp('/profile/edit');
    expect(screen.getByLabelText('Email')).toBeDisabled();
  });
});

describe('wallets', () => {
  it('adds a UPI ID using a suggested handle', async () => {
    let methods: PaymentMethod[] = [];
    const api = mockApi({
      'GET /payment-methods': () => ({ body: { data: methods } }),
      'POST /payment-methods/upi-ids': () => {
        methods = [UPI_METHOD];
        return { status: 201, body: { data: UPI_METHOD } };
      },
    });
    renderApp('/wallets');
    expect(await screen.findByRole('heading', { level: 1, name: 'Wallets' })).toBeInTheDocument();

    await userEvent.click((await screen.findAllByRole('button', { name: 'Add UPI ID' }))[0]!);
    const dialog = await screen.findByRole('dialog', { name: 'Add a UPI ID' });
    await userEvent.type(within(dialog).getByLabelText('UPI ID'), 'Asha');
    await userEvent.click(within(dialog).getByRole('button', { name: '@okhdfcbank' }));
    expect(within(dialog).getByLabelText('UPI ID')).toHaveValue('Asha@okhdfcbank');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Add UPI ID' }));

    expect(await screen.findByText('asha@okhdfcbank added.')).toBeInTheDocument();
    expect(api.callsTo('POST /payment-methods/upi-ids')[0]?.body).toEqual({ vpa: 'asha@okhdfcbank' });
    expect(await screen.findByText('asha@okhdfcbank', { selector: 'strong, span, p, h3' })).toBeInTheDocument();
  });

  it('detects the bank from the IFSC and asks for a name when it is unknown', async () => {
    mockApi();
    renderApp('/wallets');
    await userEvent.click((await screen.findAllByRole('button', { name: 'Link bank' }))[0]!);
    const dialog = await screen.findByRole('dialog', { name: 'Link a bank account' });
    const ifsc = within(dialog).getByLabelText('IFSC');

    await userEvent.type(ifsc, 'hdfc0001234');
    expect(ifsc).toHaveValue('HDFC0001234');
    expect(within(dialog).getByText('HDFC Bank detected')).toBeInTheDocument();
    expect(within(dialog).queryByLabelText('Bank name')).not.toBeInTheDocument();

    await userEvent.clear(ifsc);
    await userEvent.type(ifsc, 'ZZZZ0001234');
    expect(within(dialog).getByLabelText('Bank name')).toBeInTheDocument();
  });

  it('refuses mismatched account numbers before calling the API', async () => {
    const api = mockApi();
    renderApp('/wallets');
    await userEvent.click((await screen.findAllByRole('button', { name: 'Link bank' }))[0]!);
    const dialog = await screen.findByRole('dialog', { name: 'Link a bank account' });
    await userEvent.type(within(dialog).getByLabelText('Account number'), '123456789012');
    await userEvent.type(within(dialog).getByLabelText('Re-enter account number'), '123456789000');
    await userEvent.type(within(dialog).getByLabelText('IFSC'), 'SBIN0001234');
    await userEvent.click(within(dialog).getByRole('button', { name: /link account/i }));
    expect(within(dialog).getByText('Account numbers do not match')).toBeInTheDocument();
    expect(api.callsTo('POST /payment-methods/bank-accounts')).toHaveLength(0);
  });

  it('hides the balance when the preference is on', async () => {
    mockApi({
      'GET /users/me/preferences': { body: { data: { ...TEST_PREFERENCES, payments: { ...TEST_PREFERENCES.payments, hideBalance: true } } } },
      'GET /wallets/me': { body: { data: { ...TEST_WALLET, balanceMinor: 12_345_00 } } },
    });
    renderApp('/wallets');
    expect(await screen.findByRole('button', { name: 'Show balance' })).toBeInTheDocument();
    expect(screen.queryByText('₹12,345.00')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Show balance' }));
    expect(screen.getAllByText('₹12,345.00').length).toBeGreaterThan(0);
  });
});

describe('notification settings', () => {
  it('disables SMS alerts until a phone number is added', async () => {
    mockApi();
    renderApp('/settings/notifications');
    expect(await screen.findByRole('switch', { name: 'SMS / phone alerts' })).toBeDisabled();
    expect(screen.getByRole('link', { name: 'Add a mobile number' })).toHaveAttribute('href', '/profile/edit');
    expect(screen.getByRole('switch', { name: 'Security alerts' })).toBeDisabled();
  });

  it('saves a channel toggle', async () => {
    const api = mockApi({
      'PATCH /users/me/preferences': ({ body }) => ({
        body: { data: { ...TEST_PREFERENCES, notifications: { ...TEST_PREFERENCES.notifications, channels: { ...TEST_PREFERENCES.notifications.channels, ...(body as { notifications: { channels: object } }).notifications.channels } } } },
      }),
    });
    renderApp('/settings/notifications');
    const email = await screen.findByRole('switch', { name: 'Email alerts' });
    expect(email).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(email);
    expect(await screen.findByText('Email alerts turned off.')).toBeInTheDocument();
    expect(email).toHaveAttribute('aria-checked', 'false');
    expect(api.callsTo('PATCH /users/me/preferences')[0]?.body).toEqual({ notifications: { channels: { email: false } } });
  });
});

describe('security settings', () => {
  it('validates the change-password form', async () => {
    const api = mockApi();
    renderApp('/settings/security');
    await userEvent.type(await screen.findByLabelText('Current password'), 'correct horse battery');
    await userEvent.type(screen.getByLabelText('New password'), 'a brand new phrase');
    await userEvent.type(screen.getByLabelText('Confirm new password'), 'a brand new phrasE');
    await userEvent.click(screen.getByRole('button', { name: /change password/i }));
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(api.callsTo('POST /auth/password/change')).toHaveLength(0);
  });
});

describe('demo accounts', () => {
  const DEMO_USER = { ...TEST_USER, isDemo: true };

  it('turns off password and device changes on the security page', async () => {
    mockApi();
    renderApp('/settings/security', { user: DEMO_USER });
    expect(await screen.findByLabelText('Current password')).toBeDisabled();
    expect(screen.getByRole('button', { name: /change password/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Sign out of all devices' })).toBeDisabled();
    expect(screen.getByText('Everyone shares this password, so it cannot be changed.')).toBeInTheDocument();
  });

  it('explains the restrictions on the profile and locks editing and the photo', async () => {
    mockApi();
    renderApp('/profile', { user: DEMO_USER });
    expect(await screen.findByText('Shared demo account')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Edit profile' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'View profile photo' }));
    expect(await screen.findByRole('button', { name: 'Upload photo' })).toBeDisabled();
  });

  it('shows the edit form read-only if opened directly', async () => {
    const api = mockApi();
    renderApp('/profile/edit', { user: DEMO_USER });
    expect(await screen.findByLabelText('First name')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
    expect(api.callsTo('PATCH /users/me')).toHaveLength(0);
  });
});
