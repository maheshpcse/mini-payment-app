import { AtSign, Building2, Hash, UserRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { errorMessage, fieldErrorsFrom } from '../../shared/lib/form-errors';
import { validators } from '../../shared/lib/validation';
import { Alert } from '../../shared/ui/Alert';
import { Button } from '../../shared/ui/Button';
import { Dialog } from '../../shared/ui/Dialog';
import { TextField } from '../../shared/ui/TextField';
import { accountApi, usePaymentMethodMutation } from '../account/account-api';
import { IFSC_BANKS } from './ifsc';
import styles from './Wallets.module.css';

const IFSC_FORMAT = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const UPI_FORMAT = /^[a-z0-9][a-z0-9._-]{1,63}@[a-z][a-z0-9]{1,31}$/;
const UPI_HANDLES = ['okhdfcbank', 'oksbi', 'okicici', 'okaxis', 'ybl', 'paytm'];

export function AddBankAccountDialog({ open, onClose, defaultHolder, onAdded }: { open: boolean; onClose(): void; defaultHolder: string; onAdded(message: string): void }) {
  const add = usePaymentMethodMutation(accountApi.addBankAccount);
  const [values, setValues] = useState({ holder: defaultHolder, number: '', confirm: '', ifsc: '', bankName: '', type: 'SAVINGS' as 'SAVINGS' | 'CURRENT' });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const ifsc = values.ifsc.trim().toUpperCase();
  const detectedBank = IFSC_FORMAT.test(ifsc) ? IFSC_BANKS[ifsc.slice(0, 4)] : undefined;
  const needsBankName = IFSC_FORMAT.test(ifsc) && !detectedBank;
  const set = (field: keyof typeof values) => (event: { target: { value: string } }) => setValues((current) => ({ ...current, [field]: event.target.value }));

  function close() {
    setValues({ holder: defaultHolder, number: '', confirm: '', ifsc: '', bankName: '', type: 'SAVINGS' });
    setErrors({});
    setFormError(null);
    onClose();
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const digits = values.number.replace(/\s/g, '');
    const next = {
      holder: validators.name(values.holder, 'Account holder name'),
      number: /^\d{9,18}$/.test(digits) ? undefined : 'Account number must be 9 to 18 digits',
      confirm: values.confirm.replace(/\s/g, '') === digits ? undefined : 'Account numbers do not match',
      ifsc: IFSC_FORMAT.test(ifsc) ? undefined : 'Enter a valid IFSC, e.g. HDFC0001234',
      bankName: needsBankName && values.bankName.trim().length < 2 ? 'Bank name is required for this IFSC' : undefined,
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    setFormError(null);
    try {
      const method = await add.mutateAsync({
        accountHolderName: values.holder.trim(),
        accountNumber: digits,
        ifsc,
        accountType: values.type,
        ...(needsBankName ? { bankName: values.bankName.trim() } : {}),
      });
      onAdded(`${method.bank?.bankName ?? 'Bank account'} ${method.bank?.maskedAccountNumber ?? ''} linked.`);
      close();
    } catch (err) {
      const fields = fieldErrorsFrom(err, { accountHolderName: 'Account holder name', accountNumber: 'Account number', ifsc: 'IFSC', bankName: 'Bank name' });
      setErrors({ holder: fields.accountHolderName, number: fields.accountNumber, ifsc: fields.ifsc, bankName: fields.bankName });
      setFormError(Object.keys(fields).length ? 'Please fix the highlighted fields.' : errorMessage(err));
    }
  }

  return (
    <Dialog open={open} onClose={close} title="Link a bank account" description="Sandbox only. Use demo details, never a real account number.">
      <form className={styles.dialogForm} onSubmit={onSubmit} noValidate>
        {formError && <Alert tone="danger" title={formError} />}
        <TextField label="Account holder name" autoComplete="name" value={values.holder} onChange={set('holder')} error={errors.holder} leading={<UserRound size={18} />} />
        <TextField label="Account number" inputMode="numeric" autoComplete="off" value={values.number} onChange={set('number')} error={errors.number} leading={<Hash size={18} />} />
        <TextField label="Re-enter account number" inputMode="numeric" autoComplete="off" value={values.confirm} onChange={set('confirm')} error={errors.confirm} onPaste={(event) => event.preventDefault()} />
        <TextField
          label="IFSC"
          autoComplete="off"
          value={values.ifsc}
          onChange={(event) => setValues((current) => ({ ...current, ifsc: event.target.value.toUpperCase() }))}
          error={errors.ifsc}
          valid={Boolean(detectedBank)}
          hint={detectedBank ? `${detectedBank} detected` : 'Printed on your cheque book or passbook.'}
          leading={<Building2 size={18} />}
          maxLength={11}
        />
        {needsBankName && <TextField label="Bank name" value={values.bankName} onChange={set('bankName')} error={errors.bankName} />}
        <fieldset className={styles.segmentedField}>
          <legend>Account type</legend>
          {(['SAVINGS', 'CURRENT'] as const).map((type) => (
            <label key={type}>
              <input type="radio" name="account-type" value={type} checked={values.type === type} onChange={() => setValues((current) => ({ ...current, type }))} />
              <span>{type === 'SAVINGS' ? 'Savings' : 'Current'}</span>
            </label>
          ))}
        </fieldset>
        <p className={styles.fineprint}>Only the last four digits are stored. MiNi Pay keeps a one-way fingerprint to stop duplicates.</p>
        <div className={styles.dialogActions}>
          <Button type="submit" loading={add.isPending} loadingLabel="Linking account">
            Link account
          </Button>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

export function AddUpiDialog({ open, onClose, onAdded }: { open: boolean; onClose(): void; onAdded(message: string): void }) {
  const add = usePaymentMethodMutation(accountApi.addUpiId);
  const [vpa, setVpa] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [localPart] = vpa.split('@');

  function close() {
    setVpa('');
    setLabel('');
    setError(undefined);
    setFormError(null);
    onClose();
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const value = vpa.trim().toLowerCase();
    if (!UPI_FORMAT.test(value)) {
      setError('Enter a UPI ID like name@okhdfcbank');
      return;
    }
    setError(undefined);
    setFormError(null);
    try {
      const method = await add.mutateAsync({ vpa: value, ...(label.trim() ? { label: label.trim() } : {}) });
      onAdded(`${method.upi?.vpa ?? 'UPI ID'} added.`);
      close();
    } catch (err) {
      const fields = fieldErrorsFrom(err, { vpa: 'UPI ID' });
      setError(fields.vpa);
      setFormError(fields.vpa ? null : errorMessage(err));
    }
  }

  return (
    <Dialog open={open} onClose={close} title="Add a UPI ID" description="Sandbox only. The ID is accepted instantly without contacting any bank." size="sm">
      <form className={styles.dialogForm} onSubmit={onSubmit} noValidate>
        {formError && <Alert tone="danger" title={formError} />}
        <TextField label="UPI ID" autoComplete="off" autoCapitalize="none" value={vpa} onChange={(event) => setVpa(event.target.value)} error={error} leading={<AtSign size={18} />} />
        {localPart && !vpa.includes('@') && (
          <div className={styles.chips} aria-label="Suggested UPI handles">
            {UPI_HANDLES.map((handle) => (
              <button key={handle} type="button" className={styles.chip} onClick={() => setVpa(`${localPart}@${handle}`)}>
                @{handle}
              </button>
            ))}
          </div>
        )}
        <TextField label="Nickname (optional)" value={label} onChange={(event) => setLabel(event.target.value)} maxLength={40} hint="For example “Personal” or “Shop”." />
        <div className={styles.dialogActions}>
          <Button type="submit" loading={add.isPending} loadingLabel="Adding UPI ID">
            Add UPI ID
          </Button>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
