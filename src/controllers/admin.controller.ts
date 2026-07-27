import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';

export class AdminController {
  public getDashboard = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await adminService.getDashboardStats();
      res.status(200).json({
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  public getQueueStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await adminService.getQueueStats();
      res.status(200).json({
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  public getJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const status = req.query.status as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await adminService.getJobs(status, page, limit);
      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public getJobById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const job = await adminService.getJobById(req.params.jobId);
      res.status(200).json({
        data: job,
      });
    } catch (error) {
      next(error);
    }
  };

  public retryJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await adminService.retryJob(req.params.jobId);
      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
