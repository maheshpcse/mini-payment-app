export interface PasswordStrength {
  /** 0 (empty) to 4 (strong) */
  score: 0 | 1 | 2 | 3 | 4;
  label: 'Too short' | 'Weak' | 'Fair' | 'Good' | 'Strong';
}

export const PASSWORD_MIN_LENGTH = 10;

/**
 * Rough guidance only; the server enforces the actual rule (length ≥ 10, not
 * trivially repetitive). Length counts most, following NIST SP 800-63B.
 */
export function passwordStrength(password: string): PasswordStrength {
  if (password.length < PASSWORD_MIN_LENGTH) return { score: password ? 1 : 0, label: 'Too short' };
  let points = 0;
  if (password.length >= 12) points += 1;
  if (password.length >= 16) points += 1;
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((pattern) => pattern.test(password)).length;
  if (classes >= 3) points += 1;
  if (new Set(password).size >= 8) points += 1;
  if (new Set(password).size < 4) return { score: 1, label: 'Weak' };
  const score = Math.min(4, Math.max(1, points)) as 1 | 2 | 3 | 4;
  return { score, label: (['Weak', 'Weak', 'Fair', 'Good', 'Strong'] as const)[score] };
}
