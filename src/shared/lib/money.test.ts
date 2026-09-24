import { describe, expect, it } from 'vitest';
import { formatAmountParts } from './money';

describe('formatAmountParts', () => {
  it.each([
    [1023, '₹10.23'],
    [1, '₹0.01'],
    [0, '₹0.00'],
    [10_234_560, '₹1,02,345.60'],
    [-250, '-₹2.50'],
  ])('formats %i minor units as %s using Indian grouping', (minor, text) => {
    expect(formatAmountParts(minor).text).toBe(text);
  });

  it('splits whole and fraction parts for styling', () => {
    expect(formatAmountParts(12_845_050)).toMatchObject({ symbol: '₹', whole: '1,28,450', fraction: '50', sign: '' });
  });

  it('stays exact for large safe integers', () => {
    expect(formatAmountParts(900_719_925_474_099).text).toBe('₹90,07,19,92,54,740.99');
  });

  it('rejects non-integer input', () => {
    expect(() => formatAmountParts(10.5)).toThrow(RangeError);
  });
});
