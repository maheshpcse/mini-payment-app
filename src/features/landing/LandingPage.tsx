import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Fingerprint,
  KeyRound,
  Link2,
  LockKeyhole,
  LogIn,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Zap,
} from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router';
import { DEMO_LOGINS, DEMO_PASSWORD } from '../../config/demo';
import { appConfig } from '../../config/env';
import { PAYMENT_NAV } from '../../config/navigation';
import { ThemeSwitcher } from '../../layouts/app-shell/ThemeSwitcher';
import { Alert } from '../../shared/ui/Alert';
import { BrandMark } from '../../shared/ui/BrandMark';
import { Button } from '../../shared/ui/Button';
import { StatusPill } from '../../shared/ui/StatusPill';
import { AuthScene } from '../auth/AuthScene';
import { sessionStore } from '../auth/session-store';
import { useDemoSignIn } from '../auth/useDemoSignIn';
import { useSession } from '../auth/useSession';
import styles from './Landing.module.css';

const FEATURES = PAYMENT_NAV.filter((item) => item.id !== 'home');

const STEPS = [
  { icon: UserPlus, title: 'Create an account', text: 'Sign up with an email in under a minute, or open a shared demo account with one click.' },
  { icon: Link2, title: 'Link a sandbox bank or UPI ID', text: 'Add made-up bank accounts and UPI IDs. The bank is detected from the IFSC and only the last four digits are kept.' },
  { icon: Zap, title: 'Pay, scan and request', text: 'Send money to people and merchants, scan QR codes and split bills. These arrive with the payments engine.' },
];

const SAFEGUARDS = [
  { icon: Fingerprint, title: 'Argon2id passwords', text: 'Passwords are hashed with Argon2id at OWASP-recommended cost and never logged.' },
  { icon: KeyRound, title: 'Rotating sessions', text: 'Access tokens live only in memory. The refresh cookie is HttpOnly, rotates on every use, and a replayed token ends the session.' },
  { icon: Banknote, title: 'No full account numbers', text: 'Bank accounts are stored as the last four digits plus a keyed fingerprint, so duplicates are caught without keeping the number.' },
  { icon: MonitorSmartphone, title: 'You control your devices', text: 'See every signed-in device, sign any of them out, and changing your password signs out the rest.' },
];

const FAQ = [
  {
    q: 'Is any real money involved?',
    a: 'No. MiNi Pay is a sandbox. Balances are demo values, and no bank, card or UPI transaction ever leaves the system.',
  },
  {
    q: 'Should I enter my real bank details?',
    a: 'Please don’t. Use invented numbers: any 9 to 18 digit account number with an IFSC such as HDFC0001234 works.',
  },
  {
    q: 'What can I try today?',
    a: 'Accounts, profile and photo, notification and payment settings, security and devices, and wallets with linked bank accounts and UPI IDs. Pay, scan, bills, rewards and insights are marked “Coming soon”.',
  },
  {
    q: 'How do the demo accounts work?',
    a: `They are shared by everyone, so their name, photo, password and devices are locked. The password is ${DEMO_PASSWORD}; you can also type it on the sign-in page.`,
  },
];

export function LandingPage() {
  const { status } = useSession();
  const demo = useDemoSignIn();
  const signedIn = status === 'authenticated';

  useEffect(() => sessionStore.bootstrap(), []);

  return (
    <div className={styles.page}>
      <a href="#main-content" className={styles.skip}>
        Skip to content
      </a>
      <header className={styles.header}>
        <Link to="/welcome" className={styles.brand} aria-label="MiNi Pay home">
          <BrandMark />
        </Link>
        <nav className={styles.nav} aria-label="Sections">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#security">Security</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className={styles.headerActions}>
          <ThemeSwitcher />
          {signedIn ? (
            <Link to="/" className={`${styles.cta} ${styles.ctaPrimary} ${styles.ctaSmall}`}>
              Open app <ArrowRight size={16} aria-hidden="true" />
            </Link>
          ) : (
            <>
              <Link to="/login" className={styles.signIn}>
                Sign in
              </Link>
              <Link to="/signup" className={`${styles.cta} ${styles.ctaPrimary} ${styles.ctaSmall}`}>
                Get started
              </Link>
            </>
          )}
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className={styles.main}>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <ShieldCheck size={14} aria-hidden="true" /> Sandbox payments · no real money
            </p>
            <h1 id="hero-title" className={styles.heroTitle}>
              Payments that feel <span className={styles.highlight}>instant</span>, built to be trusted.
            </h1>
            <p className={styles.heroText}>
              MiNi Pay is a UPI-style wallet you can explore safely: link sandbox bank accounts and UPI IDs, manage devices and limits, and see how a
              modern payment app is engineered, without moving a single real rupee.
            </p>
            <div className={styles.heroActions}>
              {signedIn ? (
                <Link to="/" className={`${styles.cta} ${styles.ctaPrimary}`}>
                  Open MiNi Pay <ArrowRight size={18} aria-hidden="true" />
                </Link>
              ) : (
                <>
                  <Link to="/signup" className={`${styles.cta} ${styles.ctaPrimary}`}>
                    Create free account <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                  {appConfig.demoLogin && (
                    <Button
                      variant="secondary"
                      size="lg"
                      icon={<Sparkles size={18} />}
                      onClick={() => void demo.signIn(DEMO_LOGINS[0].email)}
                      loading={demo.pending === DEMO_LOGINS[0].email}
                      disabled={demo.pending !== null}
                      loadingLabel="Opening the demo account"
                    >
                      Try the live demo
                    </Button>
                  )}
                </>
              )}
            </div>
            {demo.error && <Alert tone="danger" title={demo.error} />}
            <ul className={styles.trust} aria-label="Highlights">
              <li>
                <BadgeCheck size={16} aria-hidden="true" /> No card or bank needed
              </li>
              <li>
                <LockKeyhole size={16} aria-hidden="true" /> Argon2id + rotating sessions
              </li>
              <li>
                <MonitorSmartphone size={16} aria-hidden="true" /> Light, dark and mobile
              </li>
            </ul>
          </div>
          <div className={styles.heroVisual}>
            <AuthScene centered />
          </div>
        </section>

        <section id="features" className={styles.section} aria-labelledby="features-title">
          <div className={styles.sectionHead}>
            <p className={styles.kicker}>Features</p>
            <h2 id="features-title">Everything a daily payment app does</h2>
            <p>What is live today is marked Live; the rest is on the roadmap and shows up in the app as it ships.</p>
          </div>
          <ul className={styles.features}>
            {FEATURES.map(({ id, label, icon: Icon, description, task }) => (
              <li key={id} className={styles.feature}>
                <span className={styles.featureIcon} aria-hidden="true">
                  <Icon size={22} />
                </span>
                <h3>{label}</h3>
                <p>{description}</p>
                <StatusPill tone={task ? 'neutral' : 'success'}>{task ? 'Coming soon' : 'Live'}</StatusPill>
              </li>
            ))}
          </ul>
        </section>

        <section id="how-it-works" className={styles.section} aria-labelledby="how-title">
          <div className={styles.sectionHead}>
            <p className={styles.kicker}>How it works</p>
            <h2 id="how-title">From sign-up to first payment in three steps</h2>
          </div>
          <ol className={styles.steps}>
            {STEPS.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {index + 1}
                </span>
                <Icon size={22} aria-hidden="true" className={styles.stepIcon} />
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="security" className={`${styles.section} ${styles.security}`} aria-labelledby="security-title">
          <div className={styles.sectionHead}>
            <p className={styles.kicker}>Security</p>
            <h2 id="security-title">Engineered like the real thing</h2>
            <p>A sandbox is only useful if it behaves like production. These safeguards are running today.</p>
          </div>
          <ul className={styles.safeguards}>
            {SAFEGUARDS.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <Icon size={22} aria-hidden="true" />
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className={styles.disclaimer}>
            <ShieldCheck size={16} aria-hidden="true" /> MiNi Pay is not a bank or a payment provider and is not connected to UPI, cards or any bank.
          </p>
        </section>

        {!signedIn && appConfig.demoLogin && (
          <section className={styles.demo} aria-labelledby="demo-title">
            <div>
              <h2 id="demo-title">See it with data already in place</h2>
              <p>
                Open a demo account with a linked UPI ID and bank account, or sign in with <code>{DEMO_LOGINS[0].email}</code> and password{' '}
                <code>{DEMO_PASSWORD}</code>.
              </p>
            </div>
            <div className={styles.demoActions}>
              {DEMO_LOGINS.map((account) => (
                <Button
                  key={account.email}
                  variant="secondary"
                  icon={<LogIn size={18} />}
                  onClick={() => void demo.signIn(account.email)}
                  loading={demo.pending === account.email}
                  disabled={demo.pending !== null}
                  loadingLabel={`Signing in as ${account.name}`}
                >
                  Continue as {account.name.split(' ')[0]}
                </Button>
              ))}
            </div>
          </section>
        )}

        <section id="faq" className={styles.section} aria-labelledby="faq-title">
          <div className={styles.sectionHead}>
            <p className={styles.kicker}>FAQ</p>
            <h2 id="faq-title">Good questions</h2>
          </div>
          <div className={styles.faq}>
            {FAQ.map(({ q, a }) => (
              <details key={q} className={styles.faqItem}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <BrandMark />
          <p>A sandbox payment experience. No real money is moved.</p>
        </div>
        <nav className={styles.footerLinks} aria-label="Footer">
          {signedIn ? <Link to="/">Open app</Link> : <Link to="/login">Sign in</Link>}
          {!signedIn && <Link to="/signup">Create account</Link>}
          <a href="#features">Features</a>
          <a href="#faq">FAQ</a>
        </nav>
        <p className={styles.footerMeta}>
          {appConfig.appEnv} · v{appConfig.version}
        </p>
      </footer>
    </div>
  );
}
