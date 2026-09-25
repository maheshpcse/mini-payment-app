import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { KeyRound, LogOut, Monitor, Smartphone } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { errorMessage, fieldErrorsFrom } from '../../shared/lib/form-errors';
import { validators } from '../../shared/lib/validation';
import { Alert } from '../../shared/ui/Alert';
import { Button } from '../../shared/ui/Button';
import { Island } from '../../shared/ui/Island';
import { PasswordField } from '../../shared/ui/PasswordField';
import { StatusPill } from '../../shared/ui/StatusPill';
import { accountKeys } from '../account/account-api';
import styles from '../account/Account.module.css';
import { authApi } from '../auth/auth-api';
import { DemoNotice } from '../auth/DemoNotice';
import { useCurrentUser, useSignOut } from '../auth/useSession';
import { describeDevice } from './device';
import { PageLoading } from './PageLoading';

const relative = new Intl.RelativeTimeFormat('en-IN', { numeric: 'auto' });

function timeAgo(iso: string): string {
  const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60_000);
  if (Math.abs(minutes) < 60) return relative.format(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relative.format(hours, 'hour');
  return relative.format(Math.round(hours / 24), 'day');
}


function ChangePasswordForm({ locked }: { locked: boolean }) {
  const [values, setValues] = useState({ current: '', next: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [message, setMessage] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);
  const queryClient = useQueryClient();
  const change = useMutation({
    mutationFn: () => authApi.changePassword(values.current, values.next),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: accountKeys.sessions }),
  });
  const set = (field: keyof typeof values) => (event: { target: { value: string } }) => setValues((current) => ({ ...current, [field]: event.target.value }));

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = {
      current: values.current ? undefined : 'Current password is required',
      next: validators.password(values.next, 'New password') ?? (values.next === values.current ? 'New password must differ from the current one' : undefined),
      confirm: values.confirm !== values.next ? 'Passwords do not match' : undefined,
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    setMessage(null);
    try {
      await change.mutateAsync();
      setValues({ current: '', next: '', confirm: '' });
      setMessage({ tone: 'success', text: 'Password changed. Your other devices have been signed out.' });
    } catch (err) {
      const fields = fieldErrorsFrom(err, { newPassword: 'New password' });
      setErrors({ next: fields.newPassword });
      setMessage({ tone: 'danger', text: fields.newPassword ? 'Please choose a different new password.' : errorMessage(err) });
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {locked && <DemoNotice>Everyone shares this password, so it cannot be changed.</DemoNotice>}
      {message && <Alert tone={message.tone} title={message.text} />}
      <fieldset className={styles.fieldset} disabled={locked}>
        <PasswordField label="Current password" autoComplete="current-password" value={values.current} onChange={set('current')} error={errors.current} />
        <PasswordField label="New password" autoComplete="new-password" value={values.next} onChange={set('next')} error={errors.next} showStrength />
        <PasswordField label="Confirm new password" autoComplete="new-password" value={values.confirm} onChange={set('confirm')} error={errors.confirm} />
        <div className={styles.formActions}>
          <Button type="submit" icon={<KeyRound size={18} />} loading={change.isPending} loadingLabel="Changing password">
            Change password
          </Button>
        </div>
      </fieldset>
    </form>
  );
}

function SessionsCard({ locked }: { locked: boolean }) {
  const queryClient = useQueryClient();
  const signOut = useSignOut();
  const sessions = useQuery({ queryKey: accountKeys.sessions, queryFn: authApi.sessions });
  const revoke = useMutation({
    mutationFn: authApi.revokeSession,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: accountKeys.sessions }),
  });

  return (
    <Island as="article" aria-labelledby="sessions-title">
      <div className={styles.cardHeader}>
        <div>
          <h2 id="sessions-title">Signed-in devices</h2>
          <p>{locked ? 'Only this browser is listed: other visitors of the demo account stay private.' : 'Sign out anything you do not recognise.'}</p>
        </div>
      </div>
      {sessions.isPending ? (
        <PageLoading label="Loading devices" />
      ) : sessions.isError ? (
        <Alert tone="danger" title={errorMessage(sessions.error)} />
      ) : (
        <ul className={styles.sessionList}>
          {sessions.data.map((session) => {
            const device = describeDevice(session.userAgent);
            const Icon = device.mobile ? Smartphone : Monitor;
            return (
              <li key={session.id} className={styles.sessionItem}>
                <span className={styles.linkIcon} aria-hidden="true">
                  <Icon size={18} />
                </span>
                <span className={styles.sessionText}>
                  <strong>{device.label}</strong>
                  <span>
                    Active {timeAgo(session.lastUsedAt)} · signed in {timeAgo(session.createdAt)}
                  </span>
                </span>
                {session.current ? (
                  <StatusPill tone="success">This device</StatusPill>
                ) : (
                  <Button variant="ghost" onClick={() => revoke.mutate(session.id)} loading={revoke.isPending && revoke.variables === session.id} loadingLabel="Signing out device">
                    Sign out
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {revoke.isError && <Alert tone="danger" title={errorMessage(revoke.error)} />}
      <div className={styles.formActions}>
        <Button variant="danger" icon={<LogOut size={18} />} onClick={() => void signOut({ everywhere: true })} disabled={locked}>
          Sign out of all devices
        </Button>
      </div>
    </Island>
  );
}

export function SecuritySettingsPage() {
  const locked = useCurrentUser().isDemo === true;
  return (
    <div className={styles.grid}>
      <Island as="article" aria-labelledby="password-title">
        <div className={styles.cardHeader}>
          <div>
            <h2 id="password-title">Change password</h2>
            <p>Changing it signs out every other device.</p>
          </div>
        </div>
        <ChangePasswordForm locked={locked} />
      </Island>
      <SessionsCard locked={locked} />
    </div>
  );
}
