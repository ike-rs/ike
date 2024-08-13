// @ts-nocheck

import { describe, expect, it } from '@std/test';
import { bytes, format, parse } from '@std/bytes';

describe('@std/bytes - bytes', () => {
  it('should return null if input is invalid', () => {
    expect(bytes(undefined)).toBeNull();
    expect(bytes(null)).toBeNull();
    expect(bytes(true)).toBeNull();
    expect(bytes(false)).toBeNull();
    expect(bytes(NaN)).toBeNull();
    expect(bytes(function () {})).toBeNull();
    expect(bytes({})).toBeNull();
    expect(bytes('foobar')).toBeNull();
  });

  it('should be able to parse a string into a number', () => {
    expect(bytes('1KB')).toBe(1024);
  });

  it('should convert a number into a string', () => {
    expect(bytes(1024)).toBe('1KB');
  });

  it('should convert a number into a string with options', () => {
    expect(bytes(1000, { thousandsSeparator: ' ' })).toBe('1 000B');
  });
});

describe('@std/bytes - parse', () => {
  it('should return null if input is invalid', () => {
    expect(parse(undefined)).toBeNull();
    expect(parse(null)).toBeNull();
    expect(parse(true)).toBeNull();
    expect(parse(false)).toBeNull();
    expect(parse(NaN)).toBeNull();
    expect(parse(() => {})).toBeNull();
    expect(parse({})).toBeNull();
    expect(parse('foobar')).toBeNull();
  });

  it('should parse raw number', () => {
    expect(parse(0)).toBe(0);
    expect(parse(-1)).toBe(-1);
    expect(parse(1)).toBe(1);
    expect(parse(10.5)).toBe(10.5);
  });

  it('should parse KB', () => {
    expect(parse('1kb')).toBe(1 * Math.pow(1024, 1));
    expect(parse('1KB')).toBe(1 * Math.pow(1024, 1));
    expect(parse('1Kb')).toBe(1 * Math.pow(1024, 1));
    expect(parse('1kB')).toBe(1 * Math.pow(1024, 1));

    expect(parse('0.5kb')).toBe(0.5 * Math.pow(1024, 1));
    expect(parse('0.5KB')).toBe(0.5 * Math.pow(1024, 1));
    expect(parse('0.5Kb')).toBe(0.5 * Math.pow(1024, 1));
    expect(parse('0.5kB')).toBe(0.5 * Math.pow(1024, 1));

    expect(parse('1.5kb')).toBe(1.5 * Math.pow(1024, 1));
    expect(parse('1.5KB')).toBe(1.5 * Math.pow(1024, 1));
    expect(parse('1.5Kb')).toBe(1.5 * Math.pow(1024, 1));
    expect(parse('1.5kB')).toBe(1.5 * Math.pow(1024, 1));
  });

  it('should parse MB', () => {
    expect(parse('1mb')).toBe(1 * Math.pow(1024, 2));
    expect(parse('1MB')).toBe(1 * Math.pow(1024, 2));
    expect(parse('1Mb')).toBe(1 * Math.pow(1024, 2));
    expect(parse('1mB')).toBe(1 * Math.pow(1024, 2));
  });

  it('should parse GB', () => {
    expect(parse('1gb')).toBe(1 * Math.pow(1024, 3));
    expect(parse('1GB')).toBe(1 * Math.pow(1024, 3));
    expect(parse('1Gb')).toBe(1 * Math.pow(1024, 3));
    expect(parse('1gB')).toBe(1 * Math.pow(1024, 3));
  });

  it('should parse TB', () => {
    expect(parse('1tb')).toBe(1 * Math.pow(1024, 4));
    expect(parse('1TB')).toBe(1 * Math.pow(1024, 4));
    expect(parse('1Tb')).toBe(1 * Math.pow(1024, 4));
    expect(parse('1tB')).toBe(1 * Math.pow(1024, 4));

    expect(parse('0.5tb')).toBe(0.5 * Math.pow(1024, 4));
    expect(parse('0.5TB')).toBe(0.5 * Math.pow(1024, 4));
    expect(parse('0.5Tb')).toBe(0.5 * Math.pow(1024, 4));
    expect(parse('0.5tB')).toBe(0.5 * Math.pow(1024, 4));

    expect(parse('1.5tb')).toBe(1.5 * Math.pow(1024, 4));
    expect(parse('1.5TB')).toBe(1.5 * Math.pow(1024, 4));
    expect(parse('1.5Tb')).toBe(1.5 * Math.pow(1024, 4));
    expect(parse('1.5tB')).toBe(1.5 * Math.pow(1024, 4));
  });

  it('should parse PB', () => {
    expect(parse('1pb')).toBe(1 * Math.pow(1024, 5));
    expect(parse('1PB')).toBe(1 * Math.pow(1024, 5));
    expect(parse('1Pb')).toBe(1 * Math.pow(1024, 5));
    expect(parse('1pB')).toBe(1 * Math.pow(1024, 5));

    expect(parse('0.5pb')).toBe(0.5 * Math.pow(1024, 5));
    expect(parse('0.5PB')).toBe(0.5 * Math.pow(1024, 5));
    expect(parse('0.5Pb')).toBe(0.5 * Math.pow(1024, 5));
    expect(parse('0.5pB')).toBe(0.5 * Math.pow(1024, 5));

    expect(parse('1.5pb')).toBe(1.5 * Math.pow(1024, 5));
    expect(parse('1.5PB')).toBe(1.5 * Math.pow(1024, 5));
    expect(parse('1.5Pb')).toBe(1.5 * Math.pow(1024, 5));
    expect(parse('1.5pB')).toBe(1.5 * Math.pow(1024, 5));
  });

  it('should assume bytes when no units', () => {
    expect(parse('0')).toBe(0);
    expect(parse('-1')).toBe(-1);
    expect(parse('1024')).toBe(1024);
    expect(parse('0x11')).toBe(0);
  });

  it('should accept negative values', () => {
    expect(parse('-1')).toBe(-1);
    expect(parse('-1024')).toBe(-1024);
    expect(parse('-1.5TB')).toBe(-1.5 * Math.pow(1024, 4));
  });

  it('should drop partial bytes', () => {
    expect(parse('1.1b')).toBe(1);
    expect(parse('1.0001kb')).toBe(1024);
  });

  it('should allow whitespace', () => {
    expect(parse('1 TB')).toBe(1 * Math.pow(1024, 4));
  });
});

describe('Test byte format function', () => {
  const pb = Math.pow(1024, 5);
  const tb = (1 << 30) * 1024;
  const gb = 1 << 30;
  const mb = 1 << 20;
  const kb = 1 << 10;

  it('Should return null if input is invalid', () => {
    expect(format(undefined)).toBeNull();
    expect(format(null)).toBeNull();
    expect(format(true)).toBeNull();
    expect(format(false)).toBeNull();
    expect(format(NaN)).toBeNull();
    expect(format(Infinity)).toBeNull();
    expect(format('')).toBeNull();
    expect(format('string')).toBeNull();
    expect(format(() => {})).toBeNull();
    expect(format({})).toBeNull();
  });

  it('Should convert numbers < 1024 to `bytes` string', () => {
    expect(format(0)?.toLowerCase()).toBe('0b');
    expect(format(100)?.toLowerCase()).toBe('100b');
    expect(format(-100)?.toLowerCase()).toBe('-100b');
  });

  it('Should convert numbers >= 1 024 to kb string', () => {
    expect(format(kb)?.toLowerCase()).toBe('1kb');
    expect(format(-kb)?.toLowerCase()).toBe('-1kb');
    expect(format(2 * kb)?.toLowerCase()).toBe('2kb');
  });

  it('Should convert numbers >= 1 048 576 to mb string', () => {
    expect(format(mb)?.toLowerCase()).toBe('1mb');
    expect(format(-mb)?.toLowerCase()).toBe('-1mb');
    expect(format(2 * mb)?.toLowerCase()).toBe('2mb');
  });

  it('Should convert numbers >= (1 << 30) to gb string', () => {
    expect(format(gb)?.toLowerCase()).toBe('1gb');
    expect(format(-gb)?.toLowerCase()).toBe('-1gb');
    expect(format(2 * gb)?.toLowerCase()).toBe('2gb');
  });

  it('Should convert numbers >= ((1 << 30) * 1024) to tb string', () => {
    expect(format(tb)?.toLowerCase()).toBe('1tb');
    expect(format(-tb)?.toLowerCase()).toBe('-1tb');
    expect(format(2 * tb)?.toLowerCase()).toBe('2tb');
  });

  it('Should convert numbers >= 1 125 899 906 842 624 to pb string', () => {
    expect(format(pb)?.toLowerCase()).toBe('1pb');
    expect(format(-pb)?.toLowerCase()).toBe('-1pb');
    expect(format(2 * pb)?.toLowerCase()).toBe('2pb');
  });

  it('Should return standard case', () => {
    expect(format(10)).toBe('10B');
    expect(format(kb)).toBe('1KB');
    expect(format(mb)).toBe('1MB');
    expect(format(gb)).toBe('1GB');
    expect(format(tb)).toBe('1TB');
    expect(format(pb)).toBe('1PB');
  });

  it('Should support custom thousands separator', () => {
    expect(format(1000)?.toLowerCase()).toBe('1000b');
    expect(format(1000, { thousandsSeparator: '' })?.toLowerCase()).toBe(
      '1000b',
    );
    expect(format(1000, { thousandsSeparator: null })?.toLowerCase()).toBe(
      '1000b',
    );
    expect(format(1000, { thousandsSeparator: '.' })?.toLowerCase()).toBe(
      '1.000b',
    );
    expect(format(1000, { thousandsSeparator: ',' })?.toLowerCase()).toBe(
      '1,000b',
    );
    expect(format(1000, { thousandsSeparator: ' ' })?.toLowerCase()).toBe(
      '1 000b',
    );
    expect(
      format(1005.1005 * kb, {
        decimalPlaces: 4,
        thousandsSeparator: '_',
      })?.toLowerCase(),
    ).toBe('1_005.1005kb');
  });

  it('Should support custom unit separator', () => {
    expect(format(1024)).toBe('1KB');
    expect(format(1024, { unitSeparator: '' })).toBe('1KB');
    expect(format(1024, { unitSeparator: null })).toBe('1KB');
    expect(format(1024, { unitSeparator: ' ' })).toBe('1 KB');
    expect(format(1024, { unitSeparator: '\t' })).toBe('1\tKB');
  });

  it('Should support custom number of decimal places', () => {
    expect(format(kb - 1, { decimalPlaces: 0 })?.toLowerCase()).toBe('1023b');
    expect(format(kb, { decimalPlaces: 0 })?.toLowerCase()).toBe('1kb');
    expect(format(1.4 * kb, { decimalPlaces: 0 })?.toLowerCase()).toBe('1kb');
    expect(format(1.5 * kb, { decimalPlaces: 0 })?.toLowerCase()).toBe('2kb');
    expect(format(kb - 1, { decimalPlaces: 1 })?.toLowerCase()).toBe('1023b');
    expect(format(kb, { decimalPlaces: 1 })?.toLowerCase()).toBe('1kb');
    expect(format(1.04 * kb, { decimalPlaces: 1 })?.toLowerCase()).toBe('1kb');
    expect(format(1.05 * kb, { decimalPlaces: 1 })?.toLowerCase()).toBe(
      '1.1kb',
    );
    expect(format(1.1005 * kb, { decimalPlaces: 4 })?.toLowerCase()).toBe(
      '1.1005kb',
    );
  });

  it('Should support fixed decimal places', () => {
    expect(
      format(kb, { decimalPlaces: 3, fixedDecimals: true })?.toLowerCase(),
    ).toBe('1.000kb');
  });

  it('Should support floats', () => {
    expect(format(1.2 * mb)?.toLowerCase()).toBe('1.2mb');
    expect(format(-1.2 * mb)?.toLowerCase()).toBe('-1.2mb');
    expect(format(1.2 * kb)?.toLowerCase()).toBe('1.2kb');
  });

  it('Should support custom unit', () => {
    expect(format(12 * mb, { unit: 'b' })?.toLowerCase()).toBe('12582912b');
    expect(format(12 * mb, { unit: 'kb' })?.toLowerCase()).toBe('12288kb');
    expect(format(12 * gb, { unit: 'mb' })?.toLowerCase()).toBe('12288mb');
    expect(format(12 * tb, { unit: 'gb' })?.toLowerCase()).toBe('12288gb');
    expect(format(12 * mb, { unit: '' })?.toLowerCase()).toBe('12mb');
    expect(format(12 * mb, { unit: 'bb' })?.toLowerCase()).toBe('12mb');
  });
});
