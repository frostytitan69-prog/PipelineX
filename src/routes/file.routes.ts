import { Router } from 'express';
import { FileController } from '../controllers/file.controller';
import { authenticateJWT } from '../common/middleware/auth.middleware';
import { uploadMiddleware } from '../common/middleware/upload.middleware';

const router = Router();
const controller = new FileController();

router.use(authenticateJWT);

router.post('/upload', uploadMiddleware, controller.upload);
router.get('/', controller.listFiles);
router.get('/:id', controller.getMetadata);
router.get('/:id/status', controller.getStatus);
router.get('/:id/result', controller.getResult);
router.get('/:id/download-url', controller.getDownloadUrl);
router.delete('/:id', controller.delete);

export default router;
