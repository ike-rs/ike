// @ts-nocheck

import { describe, expect, it } from '@std/test';
import { convertBytes, formatBytes, parseNumericValue } from '@std/format';

describe('@std/format - convertBytes', () => {
  it('should return null if input is invalid', () => {
    expect(convertBytes(undefined)).toBeNull();
    expect(convertBytes(null)).toBeNull();
    expect(convertBytes(true)).toBeNull();
    expect(convertBytes(false)).toBeNull();
    expect(convertBytes(NaN)).toBeNull();
    expect(convertBytes(function () {})).toBeNull();
    expect(convertBytes({})).toBeNull();
    expect(convertBytes('foobar')).toBeNull();
  });

  it('should be able to parse a string into a number', () => {
    expect(convertBytes('1KB')).toBe(1024);
  });

  it('should convert a number into a string', () => {
    expect(convertBytes(1024)).toBe('1KB');
  });

  it('should convert a number into a string with options', () => {
    expect(convertBytes(1000, { thousandsSeparator: ' ' })).toBe('1 000B');
  });
});

describe('@std/format ', () => {
  it('should return null if input is invalid', () => {
    expect(parseNumericValue(undefined)).toBeNull();
    expect(parseNumericValue(null)).toBeNull();
    expect(parseNumericValue(true)).toBeNull();
    expect(parseNumericValue(false)).toBeNull();
    expect(parseNumericValue(NaN)).toBeNull();
    expect(parseNumericValue(() => {})).toBeNull();
    expect(parseNumericValue({})).toBeNull();
    expect(parseNumericValue('foobar')).toBeNull();
  });

  it('should parse raw number', () => {
    expect(parseNumericValue(0)).toBe(0);
    expect(parseNumericValue(-1)).toBe(-1);
    expect(parseNumericValue(1)).toBe(1);
    expect(parseNumericValue(10.5)).toBe(10.5);
  });

  it('should parse KB', () => {
    expect(parseNumericValue('1kb')).toBe(1 * Math.pow(1024, 1));
    expect(parseNumericValue('1KB')).toBe(1 * Math.pow(1024, 1));
    expect(parseNumericValue('1Kb')).toBe(1 * Math.pow(1024, 1));
    expect(parseNumericValue('1kB')).toBe(1 * Math.pow(1024, 1));

    expect(parseNumericValue('0.5kb')).toBe(0.5 * Math.pow(1024, 1));
    expect(parseNumericValue('0.5KB')).toBe(0.5 * Math.pow(1024, 1));
    expect(parseNumericValue('0.5Kb')).toBe(0.5 * Math.pow(1024, 1));
    expect(parseNumericValue('0.5kB')).toBe(0.5 * Math.pow(1024, 1));

    expect(parseNumericValue('1.5kb')).toBe(1.5 * Math.pow(1024, 1));
    expect(parseNumericValue('1.5KB')).toBe(1.5 * Math.pow(1024, 1));
    expect(parseNumericValue('1.5Kb')).toBe(1.5 * Math.pow(1024, 1));
    expect(parseNumericValue('1.5kB')).toBe(1.5 * Math.pow(1024, 1));
  });

  it('should parse MB', () => {
    expect(parseNumericValue('1mb')).toBe(1 * Math.pow(1024, 2));
    expect(parseNumericValue('1MB')).toBe(1 * Math.pow(1024, 2));
    expect(parseNumericValue('1Mb')).toBe(1 * Math.pow(1024, 2));
    expect(parseNumericValue('1mB')).toBe(1 * Math.pow(1024, 2));
  });

  it('should parse GB', () => {
    expect(parseNumericValue('1gb')).toBe(1 * Math.pow(1024, 3));
    expect(parseNumericValue('1GB')).toBe(1 * Math.pow(1024, 3));
    expect(parseNumericValue('1Gb')).toBe(1 * Math.pow(1024, 3));
    expect(parseNumericValue('1gB')).toBe(1 * Math.pow(1024, 3));
  });

  it('should parse TB', () => {
    expect(parseNumericValue('1tb')).toBe(1 * Math.pow(1024, 4));
    expect(parseNumericValue('1TB')).toBe(1 * Math.pow(1024, 4));
    expect(parseNumericValue('1Tb')).toBe(1 * Math.pow(1024, 4));
    expect(parseNumericValue('1tB')).toBe(1 * Math.pow(1024, 4));

    expect(parseNumericValue('0.5tb')).toBe(0.5 * Math.pow(1024, 4));
    expect(parseNumericValue('0.5TB')).toBe(0.5 * Math.pow(1024, 4));
    expect(parseNumericValue('0.5Tb')).toBe(0.5 * Math.pow(1024, 4));
    expect(parseNumericValue('0.5tB')).toBe(0.5 * Math.pow(1024, 4));

    expect(parseNumericValue('1.5tb')).toBe(1.5 * Math.pow(1024, 4));
    expect(parseNumericValue('1.5TB')).toBe(1.5 * Math.pow(1024, 4));
    expect(parseNumericValue('1.5Tb')).toBe(1.5 * Math.pow(1024, 4));
    expect(parseNumericValue('1.5tB')).toBe(1.5 * Math.pow(1024, 4));
  });

  it('should parse PB', () => {
    expect(parseNumericValue('1pb')).toBe(1 * Math.pow(1024, 5));
    expect(parseNumericValue('1PB')).toBe(1 * Math.pow(1024, 5));
    expect(parseNumericValue('1Pb')).toBe(1 * Math.pow(1024, 5));
    expect(parseNumericValue('1pB')).toBe(1 * Math.pow(1024, 5));

    expect(parseNumericValue('0.5pb')).toBe(0.5 * Math.pow(1024, 5));
    expect(parseNumericValue('0.5PB')).toBe(0.5 * Math.pow(1024, 5));
    expect(parseNumericValue('0.5Pb')).toBe(0.5 * Math.pow(1024, 5));
    expect(parseNumericValue('0.5pB')).toBe(0.5 * Math.pow(1024, 5));

    expect(parseNumericValue('1.5pb')).toBe(1.5 * Math.pow(1024, 5));
    expect(parseNumericValue('1.5PB')).toBe(1.5 * Math.pow(1024, 5));
    expect(parseNumericValue('1.5Pb')).toBe(1.5 * Math.pow(1024, 5));
    expect(parseNumericValue('1.5pB')).toBe(1.5 * Math.pow(1024, 5));
  });

  it('should assume bytes when no units', () => {
    expect(parseNumericValue('0')).toBe(0);
    expect(parseNumericValue('-1')).toBe(-1);
    expect(parseNumericValue('1024')).toBe(1024);
    expect(parseNumericValue('0x11')).toBe(0);
  });

  it('should accept negative values', () => {
    expect(parseNumericValue('-1')).toBe(-1);
    expect(parseNumericValue('-1024')).toBe(-1024);
    expect(parseNumericValue('-1.5TB')).toBe(-1.5 * Math.pow(1024, 4));
  });

  it('should drop partial bytes', () => {
    expect(parseNumericValue('1.1b')).toBe(1);
    expect(parseNumericValue('1.0001kb')).toBe(1024);
  });

  it('should allow whitespace', () => {
    expect(parseNumericValue('1 TB')).toBe(1 * Math.pow(1024, 4));
  });
});

describe('@std/format - formatBytes', () => {
  const pb = Math.pow(1024, 5);
  const tb = (1 << 30) * 1024;
  const gb = 1 << 30;
  const mb = 1 << 20;
  const kb = 1 << 10;

  it('Should return null if input is invalid', () => {
    expect(formatBytes(undefined)).toBeNull();
    expect(formatBytes(null)).toBeNull();
    expect(formatBytes(true)).toBeNull();
    expect(formatBytes(false)).toBeNull();
    expect(formatBytes(NaN)).toBeNull();
    expect(formatBytes(Infinity)).toBeNull();
    expect(formatBytes('')).toBeNull();
    expect(formatBytes('string')).toBeNull();
    expect(formatBytes(() => {})).toBeNull();
    expect(formatBytes({})).toBeNull();
  });

  it('Should convert numbers < 1024 to `bytes` string', () => {
    expect(formatBytes(0)?.toLowerCase()).toBe('0b');
    expect(formatBytes(100)?.toLowerCase()).toBe('100b');
    expect(formatBytes(-100)?.toLowerCase()).toBe('-100b');
  });

  it('Should convert numbers >= 1 024 to kb string', () => {
    expect(formatBytes(kb)?.toLowerCase()).toBe('1kb');
    expect(formatBytes(-kb)?.toLowerCase()).toBe('-1kb');
    expect(formatBytes(2 * kb)?.toLowerCase()).toBe('2kb');
  });

  it('Should convert numbers >= 1 048 576 to mb string', () => {
    expect(formatBytes(mb)?.toLowerCase()).toBe('1mb');
    expect(formatBytes(-mb)?.toLowerCase()).toBe('-1mb');
    expect(formatBytes(2 * mb)?.toLowerCase()).toBe('2mb');
  });

  it('Should convert numbers >= (1 << 30) to gb string', () => {
    expect(formatBytes(gb)?.toLowerCase()).toBe('1gb');
    expect(formatBytes(-gb)?.toLowerCase()).toBe('-1gb');
    expect(formatBytes(2 * gb)?.toLowerCase()).toBe('2gb');
  });

  it('Should convert numbers >= ((1 << 30) * 1024) to tb string', () => {
    expect(formatBytes(tb)?.toLowerCase()).toBe('1tb');
    expect(formatBytes(-tb)?.toLowerCase()).toBe('-1tb');
    expect(formatBytes(2 * tb)?.toLowerCase()).toBe('2tb');
  });

  it('Should convert numbers >= 1 125 899 906 842 624 to pb string', () => {
    expect(formatBytes(pb)?.toLowerCase()).toBe('1pb');
    expect(formatBytes(-pb)?.toLowerCase()).toBe('-1pb');
    expect(formatBytes(2 * pb)?.toLowerCase()).toBe('2pb');
  });

  it('Should return standard case', () => {
    expect(formatBytes(10)).toBe('10B');
    expect(formatBytes(kb)).toBe('1KB');
    expect(formatBytes(mb)).toBe('1MB');
    expect(formatBytes(gb)).toBe('1GB');
    expect(formatBytes(tb)).toBe('1TB');
    expect(formatBytes(pb)).toBe('1PB');
  });

  it('Should support custom thousands separator', () => {
    expect(formatBytes(1000)?.toLowerCase()).toBe('1000b');
    expect(formatBytes(1000, { thousandsSeparator: '' })?.toLowerCase()).toBe(
      '1000b',
    );
    expect(formatBytes(1000, { thousandsSeparator: null })?.toLowerCase()).toBe(
      '1000b',
    );
    expect(formatBytes(1000, { thousandsSeparator: '.' })?.toLowerCase()).toBe(
      '1.000b',
    );
    expect(formatBytes(1000, { thousandsSeparator: ',' })?.toLowerCase()).toBe(
      '1,000b',
    );
    expect(formatBytes(1000, { thousandsSeparator: ' ' })?.toLowerCase()).toBe(
      '1 000b',
    );
    expect(
      formatBytes(1005.1005 * kb, {
        decimalPlaces: 4,
        thousandsSeparator: '_',
      })?.toLowerCase(),
    ).toBe('1_005.1005kb');
  });

  it('Should support custom unit separator', () => {
    expect(formatBytes(1024)).toBe('1KB');
    expect(formatBytes(1024, { unitSeparator: '' })).toBe('1KB');
    expect(formatBytes(1024, { unitSeparator: null })).toBe('1KB');
    expect(formatBytes(1024, { unitSeparator: ' ' })).toBe('1 KB');
    expect(formatBytes(1024, { unitSeparator: '\t' })).toBe('1\tKB');
  });

  it('Should support custom number of decimal places', () => {
    expect(formatBytes(kb - 1, { decimalPlaces: 0 })?.toLowerCase()).toBe(
      '1023b',
    );
    expect(formatBytes(kb, { decimalPlaces: 0 })?.toLowerCase()).toBe('1kb');
    expect(formatBytes(1.4 * kb, { decimalPlaces: 0 })?.toLowerCase()).toBe(
      '1kb',
    );
    expect(formatBytes(1.5 * kb, { decimalPlaces: 0 })?.toLowerCase()).toBe(
      '2kb',
    );
    expect(formatBytes(kb - 1, { decimalPlaces: 1 })?.toLowerCase()).toBe(
      '1023b',
    );
    expect(formatBytes(kb, { decimalPlaces: 1 })?.toLowerCase()).toBe('1kb');
    expect(formatBytes(1.04 * kb, { decimalPlaces: 1 })?.toLowerCase()).toBe(
      '1kb',
    );
    expect(formatBytes(1.05 * kb, { decimalPlaces: 1 })?.toLowerCase()).toBe(
      '1.1kb',
    );
    expect(formatBytes(1.1005 * kb, { decimalPlaces: 4 })?.toLowerCase()).toBe(
      '1.1005kb',
    );
  });

  it('Should support fixed decimal places', () => {
    expect(
      formatBytes(kb, { decimalPlaces: 3, fixedDecimals: true })?.toLowerCase(),
    ).toBe('1.000kb');
  });

  it('Should support floats', () => {
    expect(formatBytes(1.2 * mb)?.toLowerCase()).toBe('1.2mb');
    expect(formatBytes(-1.2 * mb)?.toLowerCase()).toBe('-1.2mb');
    expect(formatBytes(1.2 * kb)?.toLowerCase()).toBe('1.2kb');
  });

  it('Should support custom unit', () => {
    expect(formatBytes(12 * mb, { unit: 'b' })?.toLowerCase()).toBe(
      '12582912b',
    );
    expect(formatBytes(12 * mb, { unit: 'kb' })?.toLowerCase()).toBe('12288kb');
    expect(formatBytes(12 * gb, { unit: 'mb' })?.toLowerCase()).toBe('12288mb');
    expect(formatBytes(12 * tb, { unit: 'gb' })?.toLowerCase()).toBe('12288gb');
    expect(formatBytes(12 * mb, { unit: '' })?.toLowerCase()).toBe('12mb');
    expect(formatBytes(12 * mb, { unit: 'bb' })?.toLowerCase()).toBe('12mb');
  });
});
