import { describe, expect, it } from 'vitest';
import { formatMoney, parseMoney } from './money';

/**
 * Intl puts an invisible "non-breaking space" (character code 160) between
 * "RSD" and the number, so the two never end up on different lines.
 */
const NBSP = String.fromCharCode(160);

describe('parseMoney', () => {
  it('accepts a comma as the decimal separator', () => {
    const result = parseMoney('120,50');

    expect(result.success).toBe(true);
    expect(result.data).toBe(12050);
  });

  it('treats an empty field as "no price" (null)', () => {
    const result = parseMoney('');

    expect(result.success).toBe(true);
    expect(result.data).toBe(null);
  });

  it('converts a whole number: "120" → 12000', () => {
    const result = parseMoney('120');

    expect(result.success).toBe(true);
    expect(result.data).toBe(12000);
  });

  it('accepts one decimal: "120.5" → 12050', () => {
    const result = parseMoney('120.5');

    expect(result.success).toBe(true);
    expect(result.data).toBe(12050);
  });

  it('avoids the float trap: "19.99" → 1999', () => {
    const result = parseMoney('19.99');

    expect(result.success).toBe(true);
    expect(result.data).toBe(1999);
  });

  it('ignores spaces around the number: "  45  " → 4500', () => {
    const result = parseMoney(' 45 ');

    expect(result.success).toBe(true);
    expect(result.data).toBe(4500);
  });

  it('rejects more than 2 decimals: "1,290" and "12.345"', () => {
    const withComma = parseMoney('1,290');
    const withDot = parseMoney('12.345');

    expect(withComma.success).toBe(false);
    expect(withDot.success).toBe(false);
  });

  it('rejects a negative number: "-5"', () => {
    const result = parseMoney('-5');

    expect(result.success).toBe(false);
  });

  it('rejects letters: "abc"', () => {
    const result = parseMoney('abc');

    expect(result.success).toBe(false);
  });

  it('rejects two separators: "1.2.3"', () => {
    const result = parseMoney('1.2.3');

    expect(result.success).toBe(false);
  });

  it('accepts exactly the maximum: "1000000" → 100000000', () => {
    const result = parseMoney('1000000');

    expect(result.success).toBe(true);
    expect(result.data).toBe(100000000);
  });

  it('rejects more than the maximum: "1000000.01"', () => {
    const result = parseMoney('1000000.01');

    expect(result.success).toBe(false);
  });
});

describe('formatMoney', () => {
  it('formats dinars with 2 decimals', () => {
    expect(formatMoney(12050, 'RSD', 'en-US')).toBe(`RSD${NBSP}120.50`);
  });

  it('formats euros: 12050 → "€120.50"', () => {
    expect(formatMoney(12050, 'EUR', 'en-US')).toBe('€120.50');
  });

  it('formats zero: 0 → "RSD 0.00"', () => {
    expect(formatMoney(0, 'RSD', 'en-US')).toBe(`RSD${NBSP}0.00`);
  });

  it('adds thousands separators: 129000 → "RSD 1,290.00"', () => {
    expect(formatMoney(129000, 'RSD', 'en-US')).toBe(`RSD${NBSP}1,290.00`);
  });

  it('follows the locale: sr-RS → "1.290,00 RSD"', () => {
    expect(formatMoney(129000, 'RSD', 'sr-RS')).toBe(`1.290,00${NBSP}RSD`);
  });
});
