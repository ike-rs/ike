import { describe, expect, it } from '@std/test';

describe('fromToml function', () => {
  it('should parse simple key-value pairs correctly', () => {
    const tomlString = `
      title = "TOML Example"
    `;
    const result = Ike.parseToml(tomlString);

    expect(result.title).toBe('TOML Example');
  });

  it('should parse nested tables correctly', () => {
    const tomlString = `
      [owner]
      name = "Tom Preston-Werner"
      dob = 1979-05-27T07:32:00-08:00
    `;
    const result = Ike.parseToml(tomlString);

    expect(result.owner.name).toBe('Tom Preston-Werner');
    expect(result.owner.dob).toBeDate();
  });

  it('should parse arrays correctly', () => {
    const tomlString = `
      [database]
      ports = [8000, 8001, 8002]
      data = [["delta", "phi"], [3.14]]
    `;
    const result = Ike.parseToml(tomlString);

    expect(result.database.ports).toContainValues([8000, 8001, 8002]);
    expect(result.database.data[0]).toBe(['delta', 'phi']);
    expect(result.database.data[1]).toBe([3.14]);
  });

  it('should parse nested tables within tables correctly', () => {
    const tomlString = `
      [servers.alpha]
      ip = "10.0.0.1"
      role = "frontend"
      
      [servers.beta]
      ip = "10.0.0.2"
      role = "backend"
    `;
    const result = Ike.parseToml(tomlString);

    expect(result.servers.alpha.ip).toBe('10.0.0.1');
    expect(result.servers.alpha.role).toBe('frontend');
    expect(result.servers.beta.ip).toBe('10.0.0.2');
    expect(result.servers.beta.role).toBe('backend');
  });

  it('should parse mixed types correctly', () => {
    const tomlString = `
      [database]
      enabled = true
      temp_targets = { cpu = 79.5, case = 72.0 }
    `;
    const result = Ike.parseToml(tomlString);

    expect(result.database.enabled).toBeTruthy();
    expect(result.database.temp_targets.cpu).toBe(79.5);
    expect(result.database.temp_targets.case).toBe(72.0);
  });
});
