import { LogIn, Mail } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';
import { errorMessage } from '../../shared/lib/form-errors';
import { validators } from '../../shared/lib/validation';
import { Alert } from '../../shared/ui/Alert';
import { Button } from '../../shared/ui/Button';
import { PasswordField } from '../../shared/ui/PasswordField';
import { TextField } from '../../shared/ui/TextField';
import { authApi } from './auth-api';
import styles from './AuthForm.module.css';
import { sessionStore } from './session-store';

export function LoginPage() {
  const location = useLocation();
  const [params] = useSearchParams();
  const notice = (location.state as { signedOut?: boolean; passwordReset?: boolean } | null) ?? {};
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = { email: validators.email(email), password: password ? undefined : 'Password is required' };
    setErrors(next);
    if (next.email || next.password) return;

    setSubmitting(true);
    setFormError(null);
    try {
      sessionStore.setGrant(await authApi.login({ email: email.trim(), password }));
    } catch (err) {
      setFormError(errorMessage(err, 'Sign-in failed. Please try again.'));
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Sign in to your MiNi Pay sandbox account.</p>
      </div>
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        {notice.signedOut && !formError && <Alert tone="success" title="You have signed out." />}
        {notice.passwordReset && !formError && <Alert tone="success" title="Password updated">Sign in with your new password.</Alert>}
        {params.get('next') && !formError && !notice.signedOut && <Alert tone="info">Please sign in to continue.</Alert>}
        {formError && <Alert tone="danger" title={formError} />}
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
          leading={<Mail size={18} />}
          autoFocus
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
        />
        <div className={styles.inlineLinks}>
          <span />
          <Link to="/forgot-password" className={styles.link}>
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" className={styles.submit} loading={submitting} loadingLabel="Signing in" icon={<LogIn size={18} />}>
          Sign in
        </Button>
      </form>
      <p className={styles.switch}>
        New to MiNi Pay?{' '}
        <Link to={{ pathname: '/signup', search: location.search }} className={styles.link}>
          Create an account
        </Link>
      </p>
    </>
  );
}
