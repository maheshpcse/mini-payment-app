/**
 * Display helpers for money received from the API as integer minor units.
 * BigInt keeps whole/fraction splitting exact; the client never performs
 * financial arithmetic that the server has not already validated.
 */
const CURRENCY_META = {
  INR: { exponent: 2, symbol: '₹', locale: 'en-IN' },
} as const;

export type CurrencyCode = keyof typeof CURRENCY_META;

export interface FormattedAmount {
  sign: '' | '-';
  symbol: string;
  whole: string;
  fraction: string;
  /** Full text for screen readers and copy, e.g. "₹1,02,345.60". */
  text: string;
}

export function formatAmountParts(amountMinor: number, currency: CurrencyCode = 'INR'): FormattedAmount {
  if (!Number.isSafeInteger(amountMinor)) throw new RangeError('amountMinor must be a safe integer');
  const meta = CURRENCY_META[currency];
  const negative = amountMinor < 0;
  const abs = BigInt(Math.abs(amountMinor));
  const divisor = 10n ** BigInt(meta.exponent);
  const whole = new Intl.NumberFormat(meta.locale).format(abs / divisor);
  const fraction = (abs % divisor).toString().padStart(meta.exponent, '0');
  const sign = negative ? '-' : '';
  return { sign, symbol: meta.symbol, whole, fraction, text: `${sign}${meta.symbol}${whole}.${fraction}` };
}
