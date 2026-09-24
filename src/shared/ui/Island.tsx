import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Island.module.css';

export interface IslandProps extends HTMLAttributes<HTMLElement> {
  as?: 'section' | 'article' | 'div' | 'aside';
  tone?: 'default' | 'signature' | 'glass';
  shape?: 'island' | 'island-alt';
  children: ReactNode;
}

/** Floating surface with the asymmetric "island" geometry used across MiNi Pay. */
export function Island({ as: Tag = 'section', tone = 'default', shape = 'island', className, children, ...rest }: IslandProps) {
  return (
    <Tag className={`${styles.island} ${styles[tone]} ${styles[shape]} ${className ?? ''}`} {...rest}>
      {children}
    </Tag>
  );
}
