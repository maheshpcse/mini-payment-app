import { ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { isApiError } from '../../api/errors';
import { errorMessage, fieldErrorsFrom } from '../../shared/lib/form-errors';
import { validators } from '../../shared/lib/validation';
import { Alert } from '../../shared/ui/Alert';
import { Button } from '../../shared/ui/Button';
import { PasswordField } from '../../shared/ui/PasswordField';
import { authApi } from './auth-api';
import styles from './AuthForm.module.css';
import { sessionStore } from './session-store';

const TOKEN_FORMAT = /^[A-Za-z0-9_-]{43}$/;

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [linkInvalid, setLinkInvalid] = useState(!TOKEN_FORMAT.test(token));
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = { password: validators.password(password, 'New password'), confirm: confirm !== password ? 'Passwords do not match' : undefined };
    setErrors(next);
    if (next.password || next.confirm) return;
    setSubmitting(true);
    setFormError(null);
    try {
      await authApi.resetPassword(token, password);
      // Every session was revoked server-side, including this browser's.
      sessionStore.clear();
      navigate('/login', { replace: true, state: { passwordReset: true } });
    } catch (err) {
      if (isApiError(err) && err.code === 'AUTH_RESET_TOKEN_INVALID') setLinkInvalid(true);
      const fields = fieldErrorsFrom(err, { password: 'New password' });
      setErrors(fields);
      setFormError(fields.password ? null : errorMessage(err));
      setSubmitting(false);
    }
  }

  if (linkInvalid) {
    return (
      <>
        <div className={styles.header}>
          <h1 className={styles.title}>Link expired</h1>
          <p className={styles.subtitle}>This password reset link is invalid, has already been used or has expired.</p>
        </div>
        <Link to="/forgot-password" className={styles.link}>
          Request a new link →
        </Link>
      </>
    );
  }

  return (
    <>
      <div className={styles.header}>
        <span className={styles.iconBadge} aria-hidden="true">
          <ShieldCheck size={26} />
        </span>
        <h1 className={styles.title}>Choose a new password</h1>
        <p className={styles.subtitle}>You will be signed out on every device once it is changed.</p>
      </div>
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        {formError && <Alert tone="danger" title={formError} />}
        <PasswordField label="New password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} error={errors.password} showStrength autoFocus />
        <PasswordField label="Confirm new password" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} error={errors.confirm} />
        <Button type="submit" size="lg" className={styles.submit} loading={submitting} loadingLabel="Updating password">
          Update password
        </Button>
      </form>
    </>
  );
}
