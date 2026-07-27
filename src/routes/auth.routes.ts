import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../common/middleware/validate.middleware';
import { authenticateJWT } from '../common/middleware/auth.middleware';
import { authRateLimiter } from '../common/middleware/rate-limiter.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from '../dtos/auth.dto';

const router = Router();
const controller = new AuthController();

router.use(authRateLimiter);

router.post('/register', validateRequest(registerSchema), controller.register);
router.post('/login', validateRequest(loginSchema), controller.login);
router.post('/refresh', validateRequest(refreshTokenSchema), controller.refresh);
router.post('/logout', authenticateJWT, controller.logout);
router.get('/me', authenticateJWT, controller.me);

export default router;
