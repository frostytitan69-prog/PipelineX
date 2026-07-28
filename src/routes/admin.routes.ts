import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateJWT, authorizeRoles } from '../common/middleware/auth.middleware';
import { adminLimiter } from '../common/middleware/rate-limit.middleware';

const router = Router();
const controller = new AdminController();

// Guard all admin routes with JWT Auth, ADMIN Role requirement, and Admin Rate Limiter
router.use(authenticateJWT, authorizeRoles('ADMIN'), adminLimiter);

router.get('/dashboard', controller.getDashboard);
router.get('/queue', controller.getQueueStats);
router.get('/jobs', controller.getJobs);
router.get('/jobs/:jobId', controller.getJobById);
router.post('/jobs/:jobId/retry', controller.retryJob);

export default router;
