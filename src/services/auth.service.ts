import { prisma } from '../database/prisma.service';
import { RegisterInput, LoginInput, AuthTokensResponseDto, UserResponseDto } from '../dtos/auth.dto';
import { hashPassword, comparePasswords } from '../common/utils/password.util';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../common/utils/jwt.util';
import { AppError } from '../common/errors/app-error';

export class AuthService {
  private static sanitizeUser(user: {
    id: string;
    email: string;
    role: 'USER' | 'ADMIN';
    createdAt: Date;
    updatedAt: Date;
  }): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  public async register(input: RegisterInput): Promise<AuthTokensResponseDto> {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new AppError('An account with this email address already exists', 409, 'https://pipelinex.dev/errors/CONFLICT');
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        role: 'USER',
      },
    });

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      user: AuthService.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  public async login(input: LoginInput): Promise<AuthTokensResponseDto> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401, 'https://pipelinex.dev/errors/UNAUTHORIZED');
    }

    const isPasswordValid = await comparePasswords(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401, 'https://pipelinex.dev/errors/UNAUTHORIZED');
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      user: AuthService.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  public async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (_err) {
      throw new AppError('Invalid or expired refresh token', 401, 'https://pipelinex.dev/errors/UNAUTHORIZED');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError('Refresh token revoked or invalid', 401, 'https://pipelinex.dev/errors/UNAUTHORIZED');
    }

    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { accessToken: newAccessToken };
  }

  public async logout(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  public async getCurrentUser(userId: string): Promise<UserResponseDto> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'https://pipelinex.dev/errors/NOT_FOUND');
    }

    return AuthService.sanitizeUser(user);
  }
}
