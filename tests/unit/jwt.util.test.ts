import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  JwtPayload,
} from '../../src/common/utils/jwt.util';

describe('JWT Utility Tests', () => {
  const mockPayload: JwtPayload = {
    userId: 'user-uuid-1234',
    email: 'test@pipelinex.dev',
    role: 'USER',
  };

  it('should generate and verify a valid access token', () => {
    const token = generateAccessToken(mockPayload);
    expect(token).toBeDefined();

    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe(mockPayload.userId);
    expect(decoded.email).toBe(mockPayload.email);
    expect(decoded.role).toBe(mockPayload.role);
  });

  it('should generate and verify a valid refresh token', () => {
    const token = generateRefreshToken(mockPayload);
    expect(token).toBeDefined();

    const decoded = verifyRefreshToken(token);
    expect(decoded.userId).toBe(mockPayload.userId);
    expect(decoded.email).toBe(mockPayload.email);
    expect(decoded.role).toBe(mockPayload.role);
  });

  it('should throw an error for malformed tokens', () => {
    expect(() => verifyAccessToken('invalid.token.str')).toThrow();
  });
});
