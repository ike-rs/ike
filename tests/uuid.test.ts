import { describe, it, expect } from '@std/test';
import {
  parse,
  stringify,
  validate,
  uuidv4,
  UUID_REGEX,
  uuidv5,
} from '@std/uuid';

describe('@std/uuid \\> parse', () => {
  it('should parse a valid UUID', () => {
    const result = parse('550e8400-e29b-41d4-a716-446655440000');
    expect(() => parse('550e8400-e29b-41d4-a716-446655440000')).notToThrow();
    expect(result).toBeInstanceOf(Uint8Array);
  });

  it('should throw an error if UUID is invalid', () => {
    expect(() => parse('550e8400-e29b-41d4-a716-44665544000')).toThrow();
  });
});

describe('@std/uuid \\> stringify', () => {
  it('should stringify a valid UUID', () => {
    const uuid = new Uint8Array([
      85, 14, 132, 0, 226, 155, 65, 212, 167, 22, 68, 102, 85, 68, 64, 0,
    ]);
    const result = stringify(uuid);
    expect(result).toBe('550e8400-e29b-41d4-a716-446655444000');
  });

  it('should throw an error if UUID is not a Uint8Array', () => {
    // @ts-ignore
    expect(() => stringify('550e8400-e29b-41d4-a716-446655440000')).toThrow();
  });

  it('should throw an error if offset is not a non-negative integer', () => {
    expect(() => stringify(new Uint8Array(), -1)).toThrow();
  });

  it('should throw an error when offset is out of bounds', () => {
    expect(() =>
      stringify(
        new Uint8Array([
          85, 14, 132, 0, 226, 155, 65, 212, 167, 22, 68, 102, 85, 68, 64, 0,
        ]),
        1,
      ),
    ).toThrow();
  });

  it('should stringify a UUID with an offset', () => {
    const uuid = new Uint8Array([
      0, 85, 14, 132, 0, 226, 155, 65, 212, 167, 22, 68, 102, 85, 68, 64, 0,
    ]);
    const result = stringify(uuid, 1);
    expect(result).toBe('550e8400-e29b-41d4-a716-446655444000');
  });
});

describe('@std/uuid \\> validate', () => {
  it('should validate a valid UUID', () => {
    const result = validate('550e8400-e29b-41d4-a716-446655440000');
    expect(result).toBe(true);
  });

  it('should throw an error if UUID is invalid', () => {
    expect(validate('550e8400-e29b-41d4-a716-44665544000999')).toBe(false);
  });
});

describe('@std/uuid \\> uuidv4', () => {
  it('should generate a valid UUID', () => {
    const result = uuidv4();
    expect(() => uuidv4()).notToThrow();
    expect(result).toMatch(UUID_REGEX);
  });
});

describe('@std/uuid \\> uuidv5', () => {
  it('should generate a consistent UUIDv5 for the DNS namespace', () => {
    const name = 'example.com';
    const namespace = 'dns';
    const uuid = uuidv5(namespace, name);

    // Check if the UUID is consistent for the same input
    const uuidAgain = uuidv5(namespace, name);
    expect(uuid).toBe(uuidAgain);

    // Ensure UUID changes if the name changes
    const differentName = 'different.com';
    const differentUuid = uuidv5(namespace, differentName);
    expect(uuid).notToBe(differentUuid);
  });

  it('should generate a consistent UUIDv5 for the URL namespace', () => {
    const name = 'https://example.com';
    const namespace = 'url';
    const uuid = uuidv5(namespace, name);

    // Check if the UUID is consistent for the same input
    const uuidAgain = uuidv5(namespace, name);
    expect(uuid).toBe(uuidAgain);

    // Ensure UUID changes if the name changes
    const differentName = 'https://different.com';
    const differentUuid = uuidv5(namespace, differentName);
    expect(uuid).notToBe(differentUuid);
  });

  it('should generate a consistent UUIDv5 for the OID namespace', () => {
    const name = '1.2.840.113549';
    const namespace = 'oid';
    const uuid = uuidv5(namespace, name);

    // Check if the UUID is consistent for the same input
    const uuidAgain = uuidv5(namespace, name);
    expect(uuid).toBe(uuidAgain);

    // Ensure UUID changes if the name changes
    const differentName = '1.2.840.113550';
    const differentUuid = uuidv5(namespace, differentName);
    expect(uuid).notToBe(differentUuid);
  });

  it('should generate a consistent UUIDv5 for the X500 namespace', () => {
    const name = 'CN=John Doe, O=Example Organization, C=US';
    const namespace = 'x500';
    const uuid = uuidv5(namespace, name);

    // Check if the UUID is consistent for the same input
    const uuidAgain = uuidv5(namespace, name);
    expect(uuid).toBe(uuidAgain);

    // Ensure UUID changes if the name changes
    const differentName = 'CN=Jane Doe, O=Different Organization, C=US';
    const differentUuid = uuidv5(namespace, differentName);
    expect(uuid).notToBe(differentUuid);
  });

  it('should generate a consistent UUIDv5 for a custom namespace', () => {
    const customNamespace = uuidv4();
    const name = 'custom-name';
    const uuid = uuidv5(customNamespace, name);

    // Check if the UUID is consistent for the same input
    const uuidAgain = uuidv5(customNamespace, name);
    expect(uuid).toBe(uuidAgain);

    // Ensure UUID changes if the name changes
    const differentName = 'different-name';
    const differentUuid = uuidv5(customNamespace, differentName);
    expect(uuid).notToBe(differentUuid);
  });

  it('should generate different UUIDs for different namespaces with the same name', () => {
    const name = 'same-name';
    const uuidDNS = uuidv5('dns', name);
    const uuidURL = uuidv5('url', name);
    const uuidOID = uuidv5('oid', name);
    const uuidX500 = uuidv5('x500', name);
    const uuidCustom = uuidv5(uuidv4(), name);

    expect(uuidDNS).notToBe(uuidURL);
    expect(uuidDNS).notToBe(uuidOID);
    expect(uuidDNS).notToBe(uuidX500);
    expect(uuidDNS).notToBe(uuidCustom);
    expect(uuidURL).notToBe(uuidOID);
    expect(uuidURL).notToBe(uuidX500);
    expect(uuidURL).notToBe(uuidCustom);
  });
});
