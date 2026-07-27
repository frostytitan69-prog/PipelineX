import { hashPassword, comparePasswords } from '../../src/common/utils/password.util';

describe('Password Utility Tests', () => {
  it('should hash a raw password correctly', async () => {
    const raw = 'Password123!';
    const hash = await hashPassword(raw);

    expect(hash).toBeDefined();
    expect(hash).not.toEqual(raw);
    expect(hash.startsWith('$2b$')).toBe(true);
  });

  it('should return true for matching password and hash', async () => {
    const raw = 'Password123!';
    const hash = await hashPassword(raw);
    const match = await comparePasswords(raw, hash);

    expect(match).toBe(true);
  });

  it('should return false for incorrect password', async () => {
    const raw = 'Password123!';
    const hash = await hashPassword(raw);
    const match = await comparePasswords('WrongPassword', hash);

    expect(match).toBe(false);
  });
});
