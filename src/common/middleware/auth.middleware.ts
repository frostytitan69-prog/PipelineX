import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';
import { AppError } from '../errors/app-error';

export const authenticateJWT = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      new AppError(
        'Authentication token missing or invalid format',
        401,
        'https://pipelinex.dev/errors/UNAUTHORIZED'
      )
    );
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (_err) {
    next(
      new AppError(
        'Invalid or expired access token',
        401,
        'https://pipelinex.dev/errors/UNAUTHORIZED'
      )
    );
  }
};

export const authorizeRoles = (...allowedRoles: Array<'USER' | 'ADMIN'>) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(
        new AppError('User authentication context missing', 401, 'https://pipelinex.dev/errors/UNAUTHORIZED')
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          'Forbidden: You do not have sufficient permissions to access this resource',
          403,
          'https://pipelinex.dev/errors/FORBIDDEN'
        )
      );
    }

    next();
  };
};
