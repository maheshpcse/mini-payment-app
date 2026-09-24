import { useId } from 'react';
import styles from './BrandMark.module.css';

/** Original MiNi Pay mark: an orbiting token crossing a lowercase "m" path. */
export function BrandMark({ showWordmark = true }: { showWordmark?: boolean }) {
  const gradientId = useId();
  return (
    <span className={styles.brand}>
      <svg className={styles.mark} viewBox="0 0 40 40" role="img" aria-label="MiNi Pay">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#1400C3" />
            <stop offset="0.6" stopColor="#0984E3" />
            <stop offset="1" stopColor="#00CEC9" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="38" height="38" rx="12" ry="12" fill={`url(#${gradientId})`} />
        <path d="M10 28V17.5a4.5 4.5 0 0 1 9 0V28m0-10.5a4.5 4.5 0 0 1 9 0V28" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="31" cy="10" r="4" fill="#FF4E02" stroke="#fff" strokeWidth="1.6" />
      </svg>
      {showWordmark && (
        <span className={styles.wordmark} aria-hidden="true">
          MiNi<span>Pay</span>
        </span>
      )}
    </span>
  );
}
