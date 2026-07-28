import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateJWT } from '../common/middleware/auth.middleware';
import { authLimiter } from '../common/middleware/rate-limit.middleware';
import { validateRequest } from '../common/middleware/validate.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from '../dtos/auth.dto';

const router = Router();
const controller = new AuthController();

router.post('/register', authLimiter, validateRequest(registerSchema), controller.register);
router.post('/login', authLimiter, validateRequest(loginSchema), controller.login);
router.post('/refresh', authLimiter, validateRequest(refreshTokenSchema), controller.refresh);
router.post('/logout', authLimiter, controller.logout);
router.get('/me', authenticateJWT, controller.me);

export default router;
