import { Request, Response, NextFunction } from 'express';
import { fileService } from '../services/file.service';
import { fileQuerySchema } from '../dtos/file.dto';
import { AppError } from '../common/errors/app-error';

export class FileController {
  public upload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new AppError('User authentication context missing', 401, 'https://pipelinex.dev/errors/UNAUTHORIZED'));
      }

      if (!req.file) {
        return next(new AppError('No file provided in form field "file"', 400, 'https://pipelinex.dev/errors/VALIDATION_ERROR'));
      }

      const result = await fileService.uploadFile(req.user.userId, req.file);
      res.status(201).json({
        message: 'File uploaded and job queued successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public getStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new AppError('User authentication context missing', 401, 'https://pipelinex.dev/errors/UNAUTHORIZED'));
      }

      const status = await fileService.getFileStatus(req.user.userId, req.params.id);
      res.status(200).json({
        data: status,
      });
    } catch (error) {
      next(error);
    }
  };

  public getResult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new AppError('User authentication context missing', 401, 'https://pipelinex.dev/errors/UNAUTHORIZED'));
      }

      const result = await fileService.getFileResult(req.user.userId, req.params.id);
      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public listFiles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new AppError('User authentication context missing', 401, 'https://pipelinex.dev/errors/UNAUTHORIZED'));
      }

      const queryParams = fileQuerySchema.parse(req.query);
      const result = await fileService.getUserFiles(req.user.userId, queryParams);

      res.status(200).json({
        data: result.files,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public getMetadata = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new AppError('User authentication context missing', 401, 'https://pipelinex.dev/errors/UNAUTHORIZED'));
      }

      const file = await fileService.getFileMetadata(req.user.userId, req.params.id);
      res.status(200).json({
        data: file,
      });
    } catch (error) {
      next(error);
    }
  };

  public getDownloadUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new AppError('User authentication context missing', 401, 'https://pipelinex.dev/errors/UNAUTHORIZED'));
      }

      const result = await fileService.getDownloadUrl(req.user.userId, req.params.id);
      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new AppError('User authentication context missing', 401, 'https://pipelinex.dev/errors/UNAUTHORIZED'));
      }

      await fileService.deleteFile(req.user.userId, req.params.id);
      res.status(200).json({
        message: 'File deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
