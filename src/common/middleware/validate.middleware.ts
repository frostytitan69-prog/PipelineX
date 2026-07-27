import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '../errors/app-error';

export const validateRequest =
  (schema: AnyZodObject) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
        next(new AppError(`Validation failed: ${issues}`, 400, 'https://pipelinex.dev/errors/VALIDATION_ERROR'));
      } else {
        next(error);
      }
    }
  };
