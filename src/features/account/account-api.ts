import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { profileApi } from '../auth/auth-api';
import { sessionStore } from '../auth/session-store';
import type { User } from '../auth/types';

export interface Preferences {
  notifications: {
    channels: { push: boolean; email: boolean; sms: boolean };
    events: { payments: boolean; requests: boolean; promotions: boolean; security: true };
  };
  payments: { perTransactionLimitMinor: number; dailyLimitMinor: number; hideBalance: boolean };
  ceilings: { perTransactionMinor: number; dailyMinor: number };
}

export type PreferencesPatch = {
  notifications?: { channels?: Partial<Preferences['notifications']['channels']>; events?: Partial<Omit<Preferences['notifications']['events'], 'security'>> };
  payments?: Partial<Preferences['payments']>;
};

export interface PaymentMethod {
  id: string;
  type: 'BANK_ACCOUNT' | 'UPI_ID';
  label: string | null;
  isDefault: boolean;
  verifiedAt: string;
  createdAt: string;
  bank: {
    bankName: string;
    accountHolderName: string;
    accountLast4: string;
    maskedAccountNumber: string;
    ifsc: string;
    accountType: 'SAVINGS' | 'CURRENT';
  } | null;
  upi: { vpa: string } | null;
}

export interface WalletSummary {
  currency: 'INR';
  balanceMinor: number;
  ledgerAvailable: boolean;
  sandbox: true;
  linked: { bankAccounts: number; upiIds: number };
  defaultMethodId: string | null;
}

export interface NewBankAccount {
  accountHolderName: string;
  accountNumber: string;
  ifsc: string;
  accountType: 'SAVINGS' | 'CURRENT';
  bankName?: string;
  label?: string;
}

export function methodTitle(method: PaymentMethod): string {
  return method.bank ? `${method.bank.bankName} ${method.bank.maskedAccountNumber}` : (method.upi?.vpa ?? 'Payment method');
}

export const accountKeys = {
  preferences: ['account', 'preferences'] as const,
  paymentMethods: ['account', 'payment-methods'] as const,
  wallet: ['account', 'wallet'] as const,
  sessions: ['account', 'sessions'] as const,
};

export const accountApi = {
  preferences: () => apiClient.request<Preferences>('/users/me/preferences').then((r) => r.data),
  updatePreferences: (body: PreferencesPatch) => apiClient.request<Preferences>('/users/me/preferences', { method: 'PATCH', body }).then((r) => r.data),
  paymentMethods: () => apiClient.request<PaymentMethod[]>('/payment-methods').then((r) => r.data),
  addBankAccount: (body: NewBankAccount) => apiClient.request<PaymentMethod>('/payment-methods/bank-accounts', { method: 'POST', body }).then((r) => r.data),
  addUpiId: (body: { vpa: string; label?: string }) => apiClient.request<PaymentMethod>('/payment-methods/upi-ids', { method: 'POST', body }).then((r) => r.data),
  makeDefault: (id: string) => apiClient.request<PaymentMethod[]>(`/payment-methods/${encodeURIComponent(id)}/default`, { method: 'POST' }).then((r) => r.data),
  remove: (id: string) => apiClient.request<PaymentMethod[]>(`/payment-methods/${encodeURIComponent(id)}`, { method: 'DELETE' }).then((r) => r.data),
  wallet: () => apiClient.request<WalletSummary>('/wallets/me').then((r) => r.data),
};

export function usePreferences() {
  return useQuery({ queryKey: accountKeys.preferences, queryFn: accountApi.preferences });
}

/** Optimistic: toggles flip immediately and roll back if the server rejects the change. */
export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountApi.updatePreferences,
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: accountKeys.preferences });
      const previous = queryClient.getQueryData<Preferences>(accountKeys.preferences);
      if (previous) {
        queryClient.setQueryData<Preferences>(accountKeys.preferences, {
          ...previous,
          notifications: {
            channels: { ...previous.notifications.channels, ...patch.notifications?.channels },
            events: { ...previous.notifications.events, ...patch.notifications?.events },
          },
          payments: { ...previous.payments, ...patch.payments },
        });
      }
      return { previous };
    },
    onError: (_err, _patch, context) => {
      if (context?.previous) queryClient.setQueryData(accountKeys.preferences, context.previous);
    },
    onSuccess: (data) => queryClient.setQueryData(accountKeys.preferences, data),
  });
}

export function usePaymentMethods() {
  return useQuery({ queryKey: accountKeys.paymentMethods, queryFn: accountApi.paymentMethods });
}

export function useWallet() {
  return useQuery({ queryKey: accountKeys.wallet, queryFn: accountApi.wallet });
}

/** Every payment-method mutation returns or implies a new list; wallet counts change too. */
export function usePaymentMethodMutation<TArgs, TResult extends PaymentMethod | PaymentMethod[]>(fn: (args: TArgs) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (result) => {
      if (Array.isArray(result)) queryClient.setQueryData(accountKeys.paymentMethods, result);
      void queryClient.invalidateQueries({ queryKey: accountKeys.paymentMethods });
      void queryClient.invalidateQueries({ queryKey: accountKeys.wallet });
    },
  });
}

/** Profile writes return the updated user, which is pushed into the session so the header updates too. */
export function useProfileMutation<TArgs>(fn: (args: TArgs) => Promise<User>) {
  return useMutation({ mutationFn: fn, onSuccess: (user) => sessionStore.setUser(user) });
}

export { profileApi };
