import { LogIn, Mail, Sparkles } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';
import { DEMO_LOGINS, DEMO_PASSWORD } from '../../config/demo';
import { appConfig } from '../../config/env';
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
  const [submitting, setSubmitting] = useState<'form' | string | null>(null);

  async function signIn(credentials: { email: string; password: string }, source: string) {
    setSubmitting(source);
    setFormError(null);
    try {
      sessionStore.setGrant(await authApi.login(credentials));
    } catch (err) {
      setFormError(errorMessage(err, 'Sign-in failed. Please try again.'));
      setSubmitting(null);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = { email: validators.email(email), password: password ? undefined : 'Password is required' };
    setErrors(next);
    if (next.email || next.password) return;
    void signIn({ email: email.trim(), password }, 'form');
  }

  function signInAsDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setErrors({});
    void signIn({ email: demoEmail, password: DEMO_PASSWORD }, demoEmail);
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
        <Button
          type="submit"
          size="lg"
          className={styles.submit}
          loading={submitting === 'form'}
          disabled={submitting !== null}
          loadingLabel="Signing in"
          icon={<LogIn size={18} />}
        >
          Sign in
        </Button>
      </form>
      {appConfig.demoLogin && (
        <section className={styles.demo} aria-labelledby="demo-title">
          <h2 id="demo-title" className={styles.demoTitle}>
            <Sparkles size={16} aria-hidden="true" /> Try a demo account
          </h2>
          <ul className={styles.demoList}>
            {DEMO_LOGINS.map((demo) => (
              <li key={demo.email}>
                <Button
                  variant="secondary"
                  className={styles.demoButton}
                  onClick={() => signInAsDemo(demo.email)}
                  loading={submitting === demo.email}
                  disabled={submitting !== null}
                  loadingLabel={`Signing in as ${demo.name}`}
                >
                  <span className={styles.demoName}>Sign in as {demo.name}</span>
                  <span className={styles.demoMeta}>{demo.role}</span>
                </Button>
              </li>
            ))}
          </ul>
          <p className={styles.demoCredentials}>
            Or type <code>{DEMO_LOGINS[0].email}</code> with password <code>{DEMO_PASSWORD}</code>. Demo accounts are shared, so profile, password and
            device changes are turned off.
          </p>
        </section>
      )}
      <p className={styles.switch}>
        New to MiNi Pay?{' '}
        <Link to={{ pathname: '/signup', search: location.search }} className={styles.link}>
          Create an account
        </Link>
      </p>
    </>
  );
}
