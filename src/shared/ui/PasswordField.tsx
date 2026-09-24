import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useState } from 'react';
import { passwordStrength } from '../lib/password-strength';
import styles from './PasswordField.module.css';
import { TextField, type TextFieldProps } from './TextField';

export interface PasswordFieldProps extends Omit<TextFieldProps, 'type' | 'leading'> {
  showStrength?: boolean;
}

export function PasswordField({ showStrength = false, value, ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const strength = passwordStrength(typeof value === 'string' ? value : '');

  return (
    <div className={styles.wrapper}>
      <TextField {...props} value={value} type={visible ? 'text' : 'password'} leading={<LockKeyhole size={18} />} className={styles.field} />
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? `Hide ${props.label.toLowerCase()}` : `Show ${props.label.toLowerCase()}`}
        aria-pressed={visible}
      >
        {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
      </button>
      {showStrength && typeof value === 'string' && value.length > 0 && (
        <div className={styles.meter} data-score={strength.score} aria-live="polite">
          <span className={styles.bars} aria-hidden="true">
            {[1, 2, 3, 4].map((bar) => (
              <span key={bar} className={bar <= strength.score ? styles.barOn : styles.bar} />
            ))}
          </span>
          <span className={styles.meterLabel}>Strength: {strength.label}</span>
        </div>
      )}
    </div>
  );
}
