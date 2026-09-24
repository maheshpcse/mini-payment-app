import { PASSWORD_MIN_LENGTH } from './password-strength';

/** Client-side mirrors of the server rules, for instant feedback. The server stays authoritative. */
export const validators = {
  name(value: string, label: string): string | undefined {
    const trimmed = value.trim();
    if (!trimmed) return `${label} is required`;
    if (trimmed.length > 50) return `${label} must be at most 50 characters`;
    if (!/^[\p{L}][\p{L}\p{M} .'-]*$/u.test(trimmed)) return `${label} may contain letters, spaces, apostrophes, dots and hyphens`;
    return undefined;
  },
  email(value: string): string | undefined {
    if (!value.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())) return 'Enter a valid email address';
    return undefined;
  },
  /** Optional 10-digit Indian mobile number. */
  phone(value: string): string | undefined {
    const digits = value.replace(/[\s-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, '');
    if (!digits) return undefined;
    if (!/^[6-9]\d{9}$/.test(digits)) return 'Enter a 10-digit Indian mobile number';
    return undefined;
  },
  password(value: string, label = 'Password'): string | undefined {
    if (value.length < PASSWORD_MIN_LENGTH) return `${label} must be at least ${PASSWORD_MIN_LENGTH} characters`;
    if (value.length > 128) return `${label} must be at most 128 characters`;
    if (new Set(value).size < 4) return `${label} is too simple`;
    return undefined;
  },
};

export function formatPhone(phone: string | null): string {
  if (!phone) return '';
  const digits = phone.replace(/^\+91/, '');
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}
