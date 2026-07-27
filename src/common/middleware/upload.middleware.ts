import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import path from 'path';
import { ALLOWED_MIME_TYPES, ALLOWED_EXTENSIONS, MAX_FILE_SIZE } from '../../dtos/file.dto';
import { AppError } from '../errors/app-error';

const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  const mimeTypeValid = (ALLOWED_MIME_TYPES as readonly string[]).includes(file.mimetype);
  const ext = path.extname(file.originalname).toLowerCase();
  const extensionValid = (ALLOWED_EXTENSIONS as readonly string[]).includes(ext);

  if (!mimeTypeValid || !extensionValid) {
    return cb(
      new AppError(
        `Invalid file type '${file.mimetype}'. Supported formats: PNG, JPEG, WEBP, PDF, TXT.`,
        400,
        'https://pipelinex.dev/errors/INVALID_FILE_TYPE'
      )
    );
  }

  cb(null, true);
};

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
}).single('file');
