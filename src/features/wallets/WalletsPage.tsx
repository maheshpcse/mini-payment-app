import { AtSign, Building2, Eye, EyeOff, Landmark, Plus, Star, Trash2, WalletCards } from 'lucide-react';
import { useState } from 'react';
import { errorMessage } from '../../shared/lib/form-errors';
import { formatInr } from '../../shared/lib/money';
import { Alert } from '../../shared/ui/Alert';
import { Button } from '../../shared/ui/Button';
import { Dialog } from '../../shared/ui/Dialog';
import { Island } from '../../shared/ui/Island';
import { StatusPill } from '../../shared/ui/StatusPill';
import { accountApi, methodTitle, usePaymentMethodMutation, usePaymentMethods, usePreferences, useWallet, type PaymentMethod } from '../account/account-api';
import { useCurrentUser } from '../auth/useSession';
import { PageLoading } from '../settings/PageLoading';
import { AddBankAccountDialog, AddUpiDialog } from './AddMethodDialogs';
import styles from './Wallets.module.css';

type Notice = { tone: 'success' | 'danger'; text: string } | null;

function MethodCard({ method, onNotice, onRemove }: { method: PaymentMethod; onNotice(notice: Notice): void; onRemove(method: PaymentMethod): void }) {
  const makeDefault = usePaymentMethodMutation(accountApi.makeDefault);
  const isBank = method.type === 'BANK_ACCOUNT';
  const Icon = isBank ? Building2 : AtSign;

  return (
    <li className={styles.method} data-default={method.isDefault || undefined}>
      <span className={styles.methodLogo} data-kind={isBank ? 'bank' : 'upi'} aria-hidden="true">
        {isBank ? (method.bank?.bankName.slice(0, 1) ?? <Icon size={18} />) : <Icon size={18} />}
      </span>
      <span className={styles.methodText}>
        <strong>{isBank ? method.bank?.bankName : method.upi?.vpa}</strong>
        <span>
          {isBank
            ? `${method.bank?.accountType === 'CURRENT' ? 'Current' : 'Savings'} ${method.bank?.maskedAccountNumber} · ${method.bank?.ifsc}`
            : (method.label ?? 'UPI ID')}
        </span>
      </span>
      <span className={styles.methodActions}>
        {method.isDefault ? (
          <StatusPill tone="success">Default</StatusPill>
        ) : (
          <Button
            variant="ghost"
            icon={<Star size={16} />}
            loading={makeDefault.isPending}
            loadingLabel="Setting default"
            onClick={() =>
              makeDefault.mutate(method.id, {
                onSuccess: () => onNotice({ tone: 'success', text: `${methodTitle(method)} is now your default.` }),
                onError: (err) => onNotice({ tone: 'danger', text: errorMessage(err) }),
              })
            }
          >
            Make default
          </Button>
        )}
        <button type="button" className={styles.iconAction} onClick={() => onRemove(method)} aria-label={`Remove ${methodTitle(method)}`}>
          <Trash2 size={17} aria-hidden="true" />
        </button>
      </span>
    </li>
  );
}

export function WalletsPage() {
  const user = useCurrentUser();
  const wallet = useWallet();
  const methods = usePaymentMethods();
  const preferences = usePreferences();
  const remove = usePaymentMethodMutation(accountApi.remove);
  const [revealed, setRevealed] = useState<boolean | null>(null);
  const [dialog, setDialog] = useState<'bank' | 'upi' | null>(null);
  const [removing, setRemoving] = useState<PaymentMethod | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  const hidden = revealed === null ? (preferences.data?.payments.hideBalance ?? false) : !revealed;
  const banks = methods.data?.filter((method) => method.type === 'BANK_ACCOUNT') ?? [];
  const upiIds = methods.data?.filter((method) => method.type === 'UPI_ID') ?? [];

  function confirmRemove() {
    if (!removing) return;
    const title = methodTitle(removing);
    remove.mutate(removing.id, {
      onSuccess: () => {
        setNotice({ tone: 'success', text: `${title} removed.` });
        setRemoving(null);
      },
      onError: (err) => setNotice({ tone: 'danger', text: errorMessage(err) }),
    });
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Wallets</h1>
          <p>Your MiNi wallet, linked bank accounts and UPI IDs. Sandbox only: nothing here connects to a real bank.</p>
        </div>
      </header>

      {notice && <Alert tone={notice.tone} title={notice.text} />}

      <section className={styles.walletRow} aria-label="MiNi wallet">
        <div className={styles.walletCard}>
          <div className={styles.walletTop}>
            <span className={styles.walletBrand}>
              <WalletCards size={20} aria-hidden="true" /> MiNi wallet
            </span>
            <StatusPill tone="accent">Sandbox</StatusPill>
          </div>
          <p className={styles.balanceLabel}>Available balance</p>
          <div className={styles.balanceRow}>
            <p className={styles.balance} aria-live="polite">
              {wallet.isPending ? '…' : hidden ? '₹ ••••' : formatInr(wallet.data?.balanceMinor ?? 0)}
            </p>
            <button type="button" className={styles.revealButton} onClick={() => setRevealed(hidden)} aria-label={hidden ? 'Show balance' : 'Hide balance'}>
              {hidden ? <Eye size={18} aria-hidden="true" /> : <EyeOff size={18} aria-hidden="true" />}
            </button>
          </div>
          <p className={styles.walletFoot}>
            {user.fullName} · {wallet.data?.ledgerAvailable ? 'Ledger-backed' : 'Demo funds arrive with the sandbox ledger (BE-010)'}
          </p>
        </div>

        <Island className={styles.stats} aria-label="Linked methods">
          <div className={styles.stat}>
            <Landmark size={20} aria-hidden="true" />
            <strong>{wallet.data?.linked.bankAccounts ?? banks.length}</strong>
            <span>Bank accounts</span>
          </div>
          <div className={styles.stat}>
            <AtSign size={20} aria-hidden="true" />
            <strong>{wallet.data?.linked.upiIds ?? upiIds.length}</strong>
            <span>UPI IDs</span>
          </div>
          <div className={styles.statActions}>
            <Button icon={<Plus size={18} />} onClick={() => setDialog('bank')}>
              Link bank
            </Button>
            <Button variant="secondary" icon={<Plus size={18} />} onClick={() => setDialog('upi')}>
              Add UPI ID
            </Button>
          </div>
        </Island>
      </section>

      {methods.isPending ? (
        <PageLoading label="Loading payment methods" />
      ) : methods.isError ? (
        <Alert tone="danger" title={errorMessage(methods.error)} />
      ) : (
        <div className={styles.columns}>
          <Island as="article" aria-labelledby="banks-title">
            <div className={styles.sectionHeader}>
              <h2 id="banks-title">
                <Landmark size={18} aria-hidden="true" /> Bank accounts
              </h2>
              <Button variant="ghost" icon={<Plus size={16} />} onClick={() => setDialog('bank')}>
                Add
              </Button>
            </div>
            {banks.length ? (
              <ul className={styles.methodList}>
                {banks.map((method) => (
                  <MethodCard key={method.id} method={method} onNotice={setNotice} onRemove={setRemoving} />
                ))}
              </ul>
            ) : (
              <div className={styles.empty}>
                <Building2 size={28} aria-hidden="true" />
                <p>No bank account linked yet.</p>
                <Button variant="secondary" onClick={() => setDialog('bank')}>
                  Link a sandbox bank account
                </Button>
              </div>
            )}
          </Island>

          <Island as="article" aria-labelledby="upi-title">
            <div className={styles.sectionHeader}>
              <h2 id="upi-title">
                <AtSign size={18} aria-hidden="true" /> UPI IDs
              </h2>
              <Button variant="ghost" icon={<Plus size={16} />} onClick={() => setDialog('upi')}>
                Add
              </Button>
            </div>
            {upiIds.length ? (
              <ul className={styles.methodList}>
                {upiIds.map((method) => (
                  <MethodCard key={method.id} method={method} onNotice={setNotice} onRemove={setRemoving} />
                ))}
              </ul>
            ) : (
              <div className={styles.empty}>
                <AtSign size={28} aria-hidden="true" />
                <p>No UPI ID added yet.</p>
                <Button variant="secondary" onClick={() => setDialog('upi')}>
                  Add a sandbox UPI ID
                </Button>
              </div>
            )}
          </Island>
        </div>
      )}

      <AddBankAccountDialog open={dialog === 'bank'} onClose={() => setDialog(null)} defaultHolder={user.fullName} onAdded={(text) => setNotice({ tone: 'success', text })} />
      <AddUpiDialog open={dialog === 'upi'} onClose={() => setDialog(null)} onAdded={(text) => setNotice({ tone: 'success', text })} />

      <Dialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title="Remove payment method?"
        description={removing ? `${methodTitle(removing)} will be unlinked from MiNi Pay.` : undefined}
        size="sm"
      >
        {removing?.isDefault && <Alert tone="info">Your oldest remaining method will become the default.</Alert>}
        {remove.isError && <Alert tone="danger" title={errorMessage(remove.error)} />}
        <div className={styles.dialogActions}>
          <Button variant="danger" onClick={confirmRemove} loading={remove.isPending} loadingLabel="Removing">
            Remove
          </Button>
          <Button variant="secondary" onClick={() => setRemoving(null)}>
            Keep it
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
