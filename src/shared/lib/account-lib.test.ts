import { describe, expect, it } from 'vitest';
import { initialsOf } from './avatar';
import { formatInr, parseRupeesToMinor } from './money';
import { passwordStrength } from './password-strength';

describe('passwordStrength', () => {
  it('treats anything under ten characters as too short', () => {
    expect(passwordStrength('')).toEqual({ score: 0, label: 'Too short' });
    expect(passwordStrength('Abc!2345')).toEqual({ score: 1, label: 'Too short' });
  });

  it('marks repetitive passwords as weak regardless of length', () => {
    expect(passwordStrength('aaaaaaaaaaaaaaaaaa').label).toBe('Weak');
  });

  it('rewards length and variety', () => {
    expect(passwordStrength('correct horse battery staple').score).toBeGreaterThanOrEqual(3);
    expect(passwordStrength('Correct-Horse-9-Battery').label).toBe('Strong');
  });
});

describe('parseRupeesToMinor', () => {
  it.each([
    ['100', 10_000],
    ['1,250.5', 125_050],
    ['₹ 99.99', 9_999],
    ['0.01', 1],
  ])('%s -> %i paise', (input, expected) => {
    expect(parseRupeesToMinor(input)).toBe(expected);
  });

  it.each(['', 'abc', '1.234', '-5', '1e3'])('rejects %j', (input) => {
    expect(parseRupeesToMinor(input)).toBeNull();
  });

  it('round-trips with formatInr', () => {
    expect(formatInr(parseRupeesToMinor('1,28,450.50')!)).toBe('₹1,28,450.50');
  });
});

describe('initialsOf', () => {
  it('uses the first letter of the first and last names', () => {
    expect(initialsOf('asha', 'verma')).toBe('AV');
    expect(initialsOf('Madhu', '')).toBe('M');
  });
});
