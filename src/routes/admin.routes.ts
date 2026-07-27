import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateJWT, authorizeRoles } from '../common/middleware/auth.middleware';

const router = Router();
const controller = new AdminController();

// Guard all admin routes with JWT Auth + ADMIN Role requirement
router.use(authenticateJWT, authorizeRoles('ADMIN'));

router.get('/dashboard', controller.getDashboard);
router.get('/queue', controller.getQueueStats);
router.get('/jobs', controller.getJobs);
router.get('/jobs/:jobId', controller.getJobById);
router.post('/jobs/:jobId/retry', controller.retryJob);

export default router;
