import { formatAmountParts, type CurrencyCode } from '../lib/money';
import styles from './AmountDisplay.module.css';

export interface AmountDisplayProps {
  amountMinor: number;
  currency?: CurrencyCode;
  size?: 'sm' | 'md' | 'hero';
  /** Hides digits (e.g. balance privacy) while keeping an accessible description. */
  masked?: boolean;
}

export function AmountDisplay({ amountMinor, currency = 'INR', size = 'md', masked = false }: AmountDisplayProps) {
  const parts = formatAmountParts(amountMinor, currency);
  return (
    <span className={`${styles.amount} ${styles[size]}`} data-testid="amount">
      <span className="visually-hidden">{masked ? 'Amount hidden' : parts.text}</span>
      <span className={styles.visual} aria-hidden="true">
        {!masked && parts.sign}
        <span className={styles.symbol}>{parts.symbol}</span>
        {masked ? (
          '••••'
        ) : (
          <>
            {parts.whole}
            <span className={styles.fraction}>.{parts.fraction}</span>
          </>
        )}
      </span>
    </span>
  );
}
