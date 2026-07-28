import { Router } from 'express';
import { FileController } from '../controllers/file.controller';
import { authenticateJWT } from '../common/middleware/auth.middleware';
import { uploadMiddleware } from '../common/middleware/upload.middleware';
import { uploadLimiter } from '../common/middleware/rate-limit.middleware';
import { CacheService } from '../services/cache.service';

const router = Router();
const controller = new FileController();

router.use(authenticateJWT);

router.post('/upload', uploadLimiter, uploadMiddleware, controller.upload);
router.get('/', CacheService.cacheMiddleware('files'), controller.listFiles);
router.get('/:id', CacheService.cacheMiddleware('file'), controller.getMetadata);
router.get('/:id/status', controller.getStatus);
router.get('/:id/result', CacheService.cacheMiddleware('result'), controller.getResult);
router.get('/:id/download-url', controller.getDownloadUrl);
router.delete('/:id', controller.delete);

export default router;
