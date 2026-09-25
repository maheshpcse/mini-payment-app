import { BellRing, CalendarDays, ChevronRight, Mail, PencilLine, ShieldCheck, Smartphone, SlidersHorizontal, WalletCards } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { formatPhone } from '../../shared/lib/validation';
import { Alert } from '../../shared/ui/Alert';
import { Island } from '../../shared/ui/Island';
import { StatusPill } from '../../shared/ui/StatusPill';
import { DemoNotice } from '../auth/DemoNotice';
import { useCurrentUser } from '../auth/useSession';
import styles from './Account.module.css';
import { AvatarManager } from './AvatarManager';

const QUICK_LINKS = [
  { to: '/wallets', icon: WalletCards, title: 'Wallets & bank accounts', text: 'MiNi wallet, linked banks and UPI IDs' },
  { to: '/settings/payments', icon: SlidersHorizontal, title: 'Payment settings', text: 'Limits, default method, balance privacy' },
  { to: '/settings/notifications', icon: BellRing, title: 'Notifications', text: 'Push, email and SMS alerts' },
  { to: '/settings/security', icon: ShieldCheck, title: 'Security', text: 'Password and signed-in devices' },
];

const joinedFormatter = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' });

export function ProfilePage() {
  const user = useCurrentUser();
  const location = useLocation();
  const [status, setStatus] = useState<string | null>((location.state as { saved?: string } | null)?.saved ?? null);

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h1>Profile</h1>
          <p>How you appear to the people you pay.</p>
        </div>
        {!user.isDemo && (
          <Link to="/profile/edit" className={styles.headerAction}>
            <PencilLine size={18} aria-hidden="true" /> Edit profile
          </Link>
        )}
      </header>

      {user.isDemo && <DemoNotice>You are signed in to a shared demo account, so its name, photo, password and devices cannot be changed. Payment methods and settings can be tried freely.</DemoNotice>}
      {status && <Alert tone="success" title={status} />}

      <Island aria-label="Profile summary">
        <div className={styles.hero}>
          <AvatarManager user={user} onStatus={setStatus} />
          <div className={styles.heroText}>
            <h2>{user.fullName}</h2>
            <div className={styles.heroMeta}>
              <span>
                <Mail size={15} aria-hidden="true" /> {user.email}
              </span>
              {user.phone && (
                <span>
                  <Smartphone size={15} aria-hidden="true" /> {formatPhone(user.phone)}
                </span>
              )}
              <span>
                <CalendarDays size={15} aria-hidden="true" /> Member since {joinedFormatter.format(new Date(user.createdAt))}
              </span>
            </div>
            <div>
              <StatusPill tone="accent">{user.isDemo ? 'Demo account' : 'Sandbox account'}</StatusPill>
            </div>
          </div>
        </div>
      </Island>

      <div className={styles.grid}>
        <Island as="article" aria-labelledby="personal-title">
          <div className={styles.cardHeader}>
            <div>
              <h2 id="personal-title">Personal details</h2>
              <p>Only you can see your email and mobile number.</p>
            </div>
          </div>
          <dl className={styles.details}>
            <div>
              <dt>First name</dt>
              <dd>{user.firstName}</dd>
            </div>
            <div>
              <dt>Last name</dt>
              <dd>{user.lastName}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>
                {user.email}{' '}
                {!user.emailVerified && <StatusPill tone="warning">Unverified</StatusPill>}
              </dd>
            </div>
            <div>
              <dt>Mobile</dt>
              <dd>{user.phone ? formatPhone(user.phone) : user.isDemo ? 'Not set' : <Link to="/profile/edit">Add a mobile number</Link>}</dd>
            </div>
            <div>
              <dt>MiNi Pay ID</dt>
              <dd className={styles.mono}>{user.id}</dd>
            </div>
          </dl>
        </Island>

        <Island as="article" aria-labelledby="shortcuts-title">
          <div className={styles.cardHeader}>
            <h2 id="shortcuts-title">Account shortcuts</h2>
          </div>
          <ul className={styles.linkList}>
            {QUICK_LINKS.map(({ to, icon: Icon, title, text }) => (
              <li key={to}>
                <Link to={to} className={styles.linkRow}>
                  <span className={styles.linkIcon} aria-hidden="true">
                    <Icon size={18} />
                  </span>
                  <span className={styles.linkText}>
                    <strong>{title}</strong>
                    <span>{text}</span>
                  </span>
                  <ChevronRight size={18} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </Island>
      </div>
    </div>
  );
}
