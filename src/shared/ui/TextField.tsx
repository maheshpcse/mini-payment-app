import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import styles from './TextField.module.css';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  hint?: string;
  error?: string;
  valid?: boolean;
  leading?: ReactNode;
}

/** Floating-label field shell. Validation text is linked via aria-describedby. */
export function TextField({ label, hint, error, valid, leading, className, ...inputProps }: TextFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const state = error ? styles.invalid : valid ? styles.valid : '';

  return (
    <div className={`${styles.field} ${state} ${className ?? ''}`}>
      <div className={styles.shell}>
        {leading && (
          <span className={styles.leading} aria-hidden="true">
            {leading}
          </span>
        )}
        <input
          id={id}
          className={styles.input}
          placeholder=" "
          aria-invalid={error ? true : undefined}
          aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
          {...inputProps}
        />
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      </div>
      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className={styles.hint}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}
