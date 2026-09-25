import { BellRing, HandCoins, Mail, Megaphone, MessageSquareText, ReceiptIndianRupee, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { errorMessage } from '../../shared/lib/form-errors';
import { formatPhone } from '../../shared/lib/validation';
import { Alert } from '../../shared/ui/Alert';
import { Island } from '../../shared/ui/Island';
import { Switch } from '../../shared/ui/Switch';
import { useCurrentUser } from '../auth/useSession';
import { usePreferences, useUpdatePreferences, type PreferencesPatch } from '../account/account-api';
import styles from '../account/Account.module.css';
import { PageLoading } from './PageLoading';

type PushPermission = NotificationPermission | 'unsupported';

function currentPushPermission(): PushPermission {
  return typeof Notification === 'undefined' ? 'unsupported' : Notification.permission;
}

export function NotificationSettingsPage() {
  const user = useCurrentUser();
  const preferences = usePreferences();
  const update = useUpdatePreferences();
  const [permission, setPermission] = useState<PushPermission>(currentPushPermission);
  const [message, setMessage] = useState<{ tone: 'success' | 'danger' | 'warning'; text: string } | null>(null);

  if (preferences.isPending) return <PageLoading label="Loading notification settings" />;
  if (preferences.isError) return <Alert tone="danger" title={errorMessage(preferences.error)} />;
  const { channels, events } = preferences.data.notifications;

  function save(patch: PreferencesPatch, confirmation: string) {
    setMessage(null);
    update.mutate(patch, {
      onSuccess: () => setMessage({ tone: 'success', text: confirmation }),
      onError: (err) => setMessage({ tone: 'danger', text: errorMessage(err, 'The setting could not be saved.') }),
    });
  }

  async function togglePush(enabled: boolean) {
    if (!enabled) return save({ notifications: { channels: { push: false } } }, 'Push notifications turned off.');
    if (typeof Notification === 'undefined') {
      setMessage({ tone: 'warning', text: 'This browser does not support push notifications.' });
      return;
    }
    const result = Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission;
    setPermission(result);
    if (result !== 'granted') {
      setMessage({ tone: 'warning', text: 'Notifications are blocked for this site. Allow them in your browser settings, then try again.' });
      return;
    }
    save({ notifications: { channels: { push: true } } }, 'Push notifications are on for this browser.');
    try {
      new Notification('MiNi Pay', { body: 'Push alerts are on. You will hear about payments here.', tag: 'mini-pay-push-test' });
    } catch {
      // Some browsers only allow notifications from a service worker; the preference is still saved.
    }
  }

  const pushDescription =
    permission === 'denied'
      ? 'Blocked in your browser settings for this site.'
      : permission === 'unsupported'
        ? 'Not supported by this browser.'
        : 'Instant alerts in this browser, even when MiNi Pay is in the background.';

  return (
    <div className={styles.stack}>
      {message && <Alert tone={message.tone} title={message.text} />}
      <div className={styles.grid}>
        <Island as="article" aria-labelledby="channels-title">
          <div className={styles.cardHeader}>
            <div>
              <h2 id="channels-title">Where we reach you</h2>
              <p>Choose the channels for your alerts.</p>
            </div>
          </div>
          <Switch
            label="Push notifications"
            description={pushDescription}
            icon={<BellRing size={18} />}
            checked={channels.push && permission === 'granted'}
            disabled={permission === 'unsupported'}
            onChange={(value) => void togglePush(value)}
          />
          <Switch
            label="Email alerts"
            description={`Sent to ${user.email}`}
            icon={<Mail size={18} />}
            checked={channels.email}
            onChange={(value) => save({ notifications: { channels: { email: value } } }, value ? 'Email alerts turned on.' : 'Email alerts turned off.')}
          />
          <Switch
            label="SMS / phone alerts"
            description={
              user.phone ? (
                `Sent to ${formatPhone(user.phone)}`
              ) : (
                <>
                  <Link to="/profile/edit">Add a mobile number</Link> to receive SMS alerts.
                </>
              )
            }
            icon={<MessageSquareText size={18} />}
            checked={channels.sms && Boolean(user.phone)}
            disabled={!user.phone}
            onChange={(value) => save({ notifications: { channels: { sms: value } } }, value ? 'SMS alerts turned on.' : 'SMS alerts turned off.')}
          />
          <p className={styles.muted}>Sandbox: preferences are saved now; delivery through email, SMS and web push providers arrives with the notifications service (BE-015).</p>
        </Island>

        <Island as="article" aria-labelledby="events-title">
          <div className={styles.cardHeader}>
            <div>
              <h2 id="events-title">What we tell you about</h2>
              <p>Applies to every channel above.</p>
            </div>
          </div>
          <Switch
            label="Payments"
            description="Money sent, received, failed or refunded."
            icon={<ReceiptIndianRupee size={18} />}
            checked={events.payments}
            onChange={(value) => save({ notifications: { events: { payments: value } } }, 'Payment alerts updated.')}
          />
          <Switch
            label="Money requests"
            description="Requests you receive and reminders."
            icon={<HandCoins size={18} />}
            checked={events.requests}
            onChange={(value) => save({ notifications: { events: { requests: value } } }, 'Request alerts updated.')}
          />
          <Switch
            label="Offers & rewards"
            description="Occasional sandbox cashback and reward news."
            icon={<Megaphone size={18} />}
            checked={events.promotions}
            onChange={(value) => save({ notifications: { events: { promotions: value } } }, 'Offer alerts updated.')}
          />
          <Switch
            label="Security alerts"
            description="New sign-ins and password changes. Always on to protect your account."
            icon={<ShieldAlert size={18} />}
            checked
            disabled
            onChange={() => undefined}
          />
        </Island>
      </div>
    </div>
  );
}
