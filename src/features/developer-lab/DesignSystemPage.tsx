import { AtSign, Send } from 'lucide-react';
import { useState } from 'react';
import { AmountDisplay } from '../../shared/ui/AmountDisplay';
import { Button } from '../../shared/ui/Button';
import { Island } from '../../shared/ui/Island';
import { StatusPill } from '../../shared/ui/StatusPill';
import { TextField } from '../../shared/ui/TextField';
import styles from './DesignSystemPage.module.css';

const SWATCHES = [
  '--payment-primary',
  '--payment-secondary',
  '--payment-accent',
  '--payment-danger',
  '--payment-success',
  '--payment-warning',
  '--surface-primary',
  '--surface-elevated',
  '--surface-sunken',
  '--text-primary',
  '--text-secondary',
  '--text-muted',
];

export function DesignSystemPage() {
  const [loading, setLoading] = useState(false);

  const simulate = () => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 1600);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <StatusPill tone="info">Developer & Architecture Lab</StatusPill>
        <h1>Design system</h1>
        <p>Semantic tokens and component states for MiNi Pay. Switch theme in the top island to compare light and dark.</p>
      </header>

      <Island aria-labelledby="ds-colors">
        <h2 id="ds-colors">Semantic color tokens</h2>
        <ul className={styles.swatches}>
          {SWATCHES.map((token) => (
            <li key={token}>
              <span className={styles.swatch} style={{ background: `var(${token})` }} aria-hidden="true" />
              <span className="mono">{token}</span>
            </li>
          ))}
        </ul>
      </Island>

      <Island shape="island-alt" aria-labelledby="ds-type">
        <h2 id="ds-type">Typography</h2>
        <div className={styles.typeStack}>
          <p className={styles.display}>Display · Space Grotesk</p>
          <p>Body · Manrope keeps long descriptions calm and readable at small sizes.</p>
          <p className={styles.meta}>Metadata · 24 Sep 2026, 11:20</p>
          <p className="mono">Transaction ID · pay_01J8ZK4M2Q7R</p>
          <AmountDisplay amountMinor={12_845_050} size="hero" />
          <AmountDisplay amountMinor={10_234_560} size="md" />
          <AmountDisplay amountMinor={4_999} size="md" masked />
        </div>
      </Island>

      <Island aria-labelledby="ds-buttons">
        <h2 id="ds-buttons">Buttons and states</h2>
        <div className={styles.row}>
          <Button icon={<Send size={16} aria-hidden="true" />} onClick={simulate} loading={loading} loadingLabel="Processing sandbox payment">
            {loading ? 'Processing' : 'Pay (simulate)'}
          </Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Cancel request</Button>
          <Button disabled>Disabled</Button>
          <Button size="lg">Large CTA</Button>
        </div>
        <div className={styles.row}>
          <StatusPill tone="neutral">Initiated</StatusPill>
          <StatusPill tone="info" pulse>
            Processing
          </StatusPill>
          <StatusPill tone="success">Success</StatusPill>
          <StatusPill tone="danger">Failed</StatusPill>
          <StatusPill tone="warning">Refund pending</StatusPill>
          <StatusPill tone="accent">Sandbox</StatusPill>
        </div>
      </Island>

      <Island shape="island-alt" aria-labelledby="ds-forms">
        <h2 id="ds-forms">Form fields</h2>
        <div className={styles.fields}>
          <TextField label="Payment ID" hint="Letters, numbers and dots, e.g. asha.k@minipay" leading={<AtSign size={18} />} />
          <TextField label="Mobile number" defaultValue="98765 43210" valid hint="Looks good" inputMode="tel" />
          <TextField label="Amount" defaultValue="10.234" error="Use at most 2 decimal places." inputMode="decimal" />
          <TextField label="Linked bank (simulation)" disabled defaultValue="Not available yet" />
        </div>
      </Island>
    </div>
  );
}
