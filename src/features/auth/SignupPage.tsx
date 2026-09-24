import { Mail, Smartphone, UserRound, UserRoundPlus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router';
import { errorMessage, fieldErrorsFrom } from '../../shared/lib/form-errors';
import { validators } from '../../shared/lib/validation';
import { Alert } from '../../shared/ui/Alert';
import { Button } from '../../shared/ui/Button';
import { PasswordField } from '../../shared/ui/PasswordField';
import { TextField } from '../../shared/ui/TextField';
import { authApi } from './auth-api';
import styles from './AuthForm.module.css';
import { sessionStore } from './session-store';

const LABELS = { firstName: 'First name', lastName: 'Last name', email: 'Email', phone: 'Mobile number', password: 'Password' };

type Field = 'firstName' | 'lastName' | 'email' | 'phone' | 'password' | 'confirm' | 'terms';

export function SignupPage() {
  const location = useLocation();
  const [values, setValues] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirm: '' });
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (field: keyof typeof values) => (event: { target: { value: string } }) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  function validate() {
    return {
      firstName: validators.name(values.firstName, 'First name'),
      lastName: validators.name(values.lastName, 'Last name'),
      email: validators.email(values.email),
      phone: validators.phone(values.phone),
      password: validators.password(values.password),
      confirm: values.confirm !== values.password ? 'Passwords do not match' : undefined,
      terms: accepted ? undefined : 'Please confirm you understand this is a sandbox',
    };
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setSubmitting(true);
    setFormError(null);
    try {
      const grant = await authApi.register({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        password: values.password,
        ...(values.phone.trim() ? { phone: values.phone.trim() } : {}),
      });
      sessionStore.setGrant(grant);
    } catch (err) {
      const fields = fieldErrorsFrom(err, LABELS);
      setErrors(fields);
      setFormError(Object.keys(fields).length ? 'Please fix the highlighted fields.' : errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>Set up a sandbox wallet in under a minute.</p>
      </div>
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        {formError && <Alert tone="danger" title={formError} />}
        <div className={styles.row}>
          <TextField label="First name" autoComplete="given-name" value={values.firstName} onChange={set('firstName')} error={errors.firstName} leading={<UserRound size={18} />} autoFocus />
          <TextField label="Last name" autoComplete="family-name" value={values.lastName} onChange={set('lastName')} error={errors.lastName} />
        </div>
        <TextField label="Email" type="email" inputMode="email" autoComplete="email" value={values.email} onChange={set('email')} error={errors.email} leading={<Mail size={18} />} />
        <TextField
          label="Mobile number (optional)"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={values.phone}
          onChange={set('phone')}
          error={errors.phone}
          hint="Used for SMS alerts. Indian numbers only."
          leading={<Smartphone size={18} />}
        />
        <PasswordField label="Password" autoComplete="new-password" value={values.password} onChange={set('password')} error={errors.password} hint="At least 10 characters. A short phrase works well." showStrength />
        <PasswordField label="Confirm password" autoComplete="new-password" value={values.confirm} onChange={set('confirm')} error={errors.confirm} />
        <label className={styles.check}>
          <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} aria-invalid={errors.terms ? true : undefined} />
          <span>I understand MiNi Pay is a sandbox: balances are demo money and no real bank, card or UPI transactions happen.</span>
        </label>
        {errors.terms && <p className={styles.checkError}>{errors.terms}</p>}
        <Button type="submit" size="lg" className={styles.submit} loading={submitting} loadingLabel="Creating account" icon={<UserRoundPlus size={18} />}>
          Create account
        </Button>
      </form>
      <p className={styles.switch}>
        Already have an account?{' '}
        <Link to={{ pathname: '/login', search: location.search }} className={styles.link}>
          Sign in
        </Link>
      </p>
    </>
  );
}
