import { useState } from 'react';
import { paletteFor } from '../lib/avatar';
import styles from './Avatar.module.css';

export interface AvatarProps {
  name: string;
  initials: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Decorative avatars (next to a visible name) are hidden from assistive tech. */
  decorative?: boolean;
  className?: string;
}

export function Avatar({ name, initials, src, size = 'md', decorative = false, className }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && failedSrc !== src;
  return (
    <span
      className={`${styles.avatar} ${styles[size]} ${className ?? ''}`}
      data-palette={paletteFor(name)}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative || undefined}
    >
      {showImage ? (
        <img src={src!} alt="" className={styles.image} onError={() => setFailedSrc(src!)} draggable={false} />
      ) : (
        <span className={styles.initials} data-testid="avatar-initials">
          {initials}
        </span>
      )}
    </span>
  );
}
