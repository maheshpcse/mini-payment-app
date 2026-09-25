import { EyeOff, IndianRupee } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { errorMessage } from '../../shared/lib/form-errors';
import { formatInr, parseRupeesToMinor } from '../../shared/lib/money';
import { Alert } from '../../shared/ui/Alert';
import { Button } from '../../shared/ui/Button';
import { Island } from '../../shared/ui/Island';
import { Switch } from '../../shared/ui/Switch';
import { TextField } from '../../shared/ui/TextField';
import { accountApi, methodTitle, usePaymentMethodMutation, usePaymentMethods, usePreferences, useUpdatePreferences, type Preferences } from '../account/account-api';
import styles from '../account/Account.module.css';
import { PageLoading } from './PageLoading';
import settings from './Settings.module.css';

const toRupees = (minor: number) => String(minor / 100);

function LimitsForm({ preferences }: { preferences: Preferences }) {
  const update = useUpdatePreferences();
  const { ceilings, payments } = preferences;
  const [perTransaction, setPerTransaction] = useState(toRupees(payments.perTransactionLimitMinor));
  const [daily, setDaily] = useState(toRupees(payments.dailyLimitMinor));
  const [errors, setErrors] = useState<{ perTransaction?: string; daily?: string }>({});
  const [message, setMessage] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const perMinor = parseRupeesToMinor(perTransaction);
    const dailyMinor = parseRupeesToMinor(daily);
    const next: typeof errors = {};
    if (!perMinor) next.perTransaction = 'Enter an amount in rupees';
    else if (perMinor > ceilings.perTransactionMinor) next.perTransaction = `Maximum is ${formatInr(ceilings.perTransactionMinor)}`;
    if (!dailyMinor) next.daily = 'Enter an amount in rupees';
    else if (dailyMinor > ceilings.dailyMinor) next.daily = `Maximum is ${formatInr(ceilings.dailyMinor)}`;
    if (perMinor && dailyMinor && perMinor > dailyMinor) next.perTransaction = 'Cannot be higher than the daily limit';
    setErrors(next);
    if (Object.keys(next).length || !perMinor || !dailyMinor) return;
    setMessage(null);
    update.mutate(
      { payments: { perTransactionLimitMinor: perMinor, dailyLimitMinor: dailyMinor } },
      {
        onSuccess: () => setMessage({ tone: 'success', text: 'Payment limits saved.' }),
        onError: (err) => setMessage({ tone: 'danger', text: errorMessage(err, 'Limits could not be saved.') }),
      },
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {message && <Alert tone={message.tone} title={message.text} />}
      <TextField
        label="Per payment limit (₹)"
        inputMode="decimal"
        value={perTransaction}
        onChange={(event) => setPerTransaction(event.target.value)}
        error={errors.perTransaction}
        hint={`Currently ${formatInr(payments.perTransactionLimitMinor)} · up to ${formatInr(ceilings.perTransactionMinor)}`}
        leading={<IndianRupee size={18} />}
        className={styles.amountInput}
      />
      <TextField
        label="Daily limit (₹)"
        inputMode="decimal"
        value={daily}
        onChange={(event) => setDaily(event.target.value)}
        error={errors.daily}
        hint={`Currently ${formatInr(payments.dailyLimitMinor)} · up to ${formatInr(ceilings.dailyMinor)}`}
        leading={<IndianRupee size={18} />}
        className={styles.amountInput}
      />
      <div className={styles.formActions}>
        <Button type="submit" loading={update.isPending} loadingLabel="Saving limits">
          Save limits
        </Button>
      </div>
    </form>
  );
}

export function PaymentSettingsPage() {
  const preferences = usePreferences();
  const methods = usePaymentMethods();
  const update = useUpdatePreferences();
  const makeDefault = usePaymentMethodMutation(accountApi.makeDefault);
  const [message, setMessage] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);

  if (preferences.isPending) return <PageLoading label="Loading payment settings" />;
  if (preferences.isError) return <Alert tone="danger" title={errorMessage(preferences.error)} />;

  return (
    <div className={styles.stack}>
      {message && <Alert tone={message.tone} title={message.text} />}
      <div className={styles.grid}>
        <Island as="article" aria-labelledby="limits-title">
          <div className={styles.cardHeader}>
            <div>
              <h2 id="limits-title">Spending limits</h2>
              <p>Payments above these limits will be blocked before they start.</p>
            </div>
          </div>
          <LimitsForm preferences={preferences.data} />
        </Island>

        <div className={styles.stack}>
          <Island as="article" aria-labelledby="default-title">
            <div className={styles.cardHeader}>
              <div>
                <h2 id="default-title">Default payment method</h2>
                <p>Pre-selected when you pay someone.</p>
              </div>
            </div>
            {methods.isPending ? (
              <PageLoading label="Loading payment methods" />
            ) : methods.data && methods.data.length > 0 ? (
              <fieldset className={settings.methodOptions}>
                <legend className="visually-hidden">Default payment method</legend>
                {methods.data.map((method) => (
                  <label key={method.id} className={settings.methodOption}>
                    <input
                      type="radio"
                      name="default-method"
                      checked={method.isDefault}
                      disabled={makeDefault.isPending}
                      onChange={() =>
                        makeDefault.mutate(method.id, {
                          onSuccess: () => setMessage({ tone: 'success', text: `${methodTitle(method)} is now your default.` }),
                          onError: (err) => setMessage({ tone: 'danger', text: errorMessage(err) }),
                        })
                      }
                    />
                    <span>
                      <strong>{methodTitle(method)}</strong>
                      <small>{method.type === 'BANK_ACCOUNT' ? 'Bank account' : 'UPI ID'}</small>
                    </span>
                  </label>
                ))}
              </fieldset>
            ) : (
              <p className={styles.muted}>
                No bank account or UPI ID linked yet. <Link to="/wallets">Link one in Wallets</Link>.
              </p>
            )}
          </Island>

          <Island as="article" aria-labelledby="privacy-title">
            <div className={styles.cardHeader}>
              <h2 id="privacy-title">Privacy</h2>
            </div>
            <Switch
              label="Hide balance by default"
              description="Show •••• instead of your wallet balance until you tap to reveal it."
              icon={<EyeOff size={18} />}
              checked={preferences.data.payments.hideBalance}
              onChange={(value) =>
                update.mutate(
                  { payments: { hideBalance: value } },
                  {
                    onSuccess: () => setMessage({ tone: 'success', text: value ? 'Balance will be hidden.' : 'Balance will be shown.' }),
                    onError: (err) => setMessage({ tone: 'danger', text: errorMessage(err) }),
                  },
                )
              }
            />
          </Island>
        </div>
      </div>
    </div>
  );
}
