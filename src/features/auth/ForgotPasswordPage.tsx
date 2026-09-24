import { ArrowLeft, KeyRound, Mail, MailCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { errorMessage } from '../../shared/lib/form-errors';
import { validators } from '../../shared/lib/validation';
import { Alert } from '../../shared/ui/Alert';
import { Button } from '../../shared/ui/Button';
import { TextField } from '../../shared/ui/TextField';
import { authApi } from './auth-api';
import styles from './AuthForm.module.css';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState<{ sandboxResetToken?: string } | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const invalid = validators.email(email);
    setError(invalid);
    if (invalid) return;
    setSubmitting(true);
    setFormError(null);
    try {
      setSent(await authApi.forgotPassword(email.trim()));
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <>
        <div className={styles.header}>
          <span className={styles.iconBadge} aria-hidden="true">
            <MailCheck size={26} />
          </span>
          <h1 className={styles.title}>Check your email</h1>
          <p className={styles.subtitle}>
            If an account exists for <strong>{email.trim()}</strong>, we have sent a link to reset the password. It expires in 30 minutes.
          </p>
        </div>
        {sent.sandboxResetToken && (
          <div className={styles.sandboxBox}>
            <p>
              <strong>Sandbox inbox.</strong> Email delivery is not connected in this local environment, so the reset link is shown here instead.
            </p>
            <Link to={`/reset-password?token=${encodeURIComponent(sent.sandboxResetToken)}`} className={styles.link}>
              Open reset link →
            </Link>
          </div>
        )}
        <p className={styles.switch}>
          <Link to="/login" className={styles.link}>
            <ArrowLeft size={14} aria-hidden="true" /> Back to sign in
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <div className={styles.header}>
        <span className={styles.iconBadge} aria-hidden="true">
          <KeyRound size={26} />
        </span>
        <h1 className={styles.title}>Forgot password?</h1>
        <p className={styles.subtitle}>Enter the email you signed up with and we will send you a reset link.</p>
      </div>
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        {formError && <Alert tone="danger" title={formError} />}
        <TextField label="Email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} error={error} leading={<Mail size={18} />} autoFocus />
        <Button type="submit" size="lg" className={styles.submit} loading={submitting} loadingLabel="Sending reset link">
          Send reset link
        </Button>
      </form>
      <p className={styles.switch}>
        Remembered it?{' '}
        <Link to="/login" className={styles.link}>
          Sign in
        </Link>
      </p>
    </>
  );
}
