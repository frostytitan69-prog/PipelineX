import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PipelineX API Documentation',
      version: '1.0.0',
      description: 'Production-quality asynchronous file processing engine API documentation.',
      contact: {
        name: 'PipelineX Team',
        url: 'https://github.com/frostytitan69-prog/PipelineX',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/v1`,
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token in the format: Bearer <token>',
        },
      },
      schemas: {
        UserResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
            email: { type: 'string', format: 'email', example: 'developer@pipelinex.dev' },
            role: { type: 'string', enum: ['USER', 'ADMIN'], example: 'USER' },
            createdAt: { type: 'string', format: 'date-time', example: '2026-07-27T20:50:00.000Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2026-07-27T20:50:00.000Z' },
          },
        },
        FileUploadResponse: {
          type: 'object',
          properties: {
            fileId: { type: 'string', format: 'uuid', example: 'd3b07384-d113-40a4-8093-5c080036ce92' },
            originalName: { type: 'string', example: 'sample_document.pdf' },
            mimeType: { type: 'string', example: 'application/pdf' },
            size: { type: 'integer', example: 1048576 },
            status: { type: 'string', enum: ['UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED'], example: 'UPLOADED' },
            jobId: { type: 'string', example: 'd3b07384-d113-40a4-8093-5c080036ce92' },
            uploadedAt: { type: 'string', format: 'date-time', example: '2026-07-27T21:20:00.000Z' },
          },
        },
        FileStatusResponse: {
          type: 'object',
          properties: {
            fileId: { type: 'string', format: 'uuid', example: 'd3b07384-d113-40a4-8093-5c080036ce92' },
            status: { type: 'string', enum: ['UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED'], example: 'COMPLETED' },
          },
        },
        FileMetadata: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: 'd3b07384-d113-40a4-8093-5c080036ce92' },
            userId: { type: 'string', format: 'uuid', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
            originalName: { type: 'string', example: 'sample_document.pdf' },
            mimeType: { type: 'string', example: 'application/pdf' },
            size: { type: 'integer', example: 1048576 },
            storageKey: { type: 'string', example: 'uploads/f47ac10b-58cc-4372-a567-0e02b2c3d479/d3b07384.pdf' },
            fileHash: { type: 'string', example: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
            status: { type: 'string', enum: ['UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED'], example: 'COMPLETED' },
            createdAt: { type: 'string', format: 'date-time', example: '2026-07-27T21:20:00.000Z' },
          },
        },
        DownloadUrlResponse: {
          type: 'object',
          properties: {
            fileId: { type: 'string', format: 'uuid', example: 'd3b07384-d113-40a4-8093-5c080036ce92' },
            downloadUrl: { type: 'string', example: 'https://pipelinex-uploads.r2.cloudflarestorage.com/uploads/...?X-Amz-Signature=...' },
            expiresInSeconds: { type: 'integer', example: 900 },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            type: { type: 'string', example: 'https://pipelinex.dev/errors/INVALID_FILE_TYPE' },
            title: { type: 'string', example: 'Invalid File Type' },
            status: { type: 'integer', example: 400 },
            detail: { type: 'string', example: 'Only PNG, JPEG, WEBP, PDF, and TXT files are supported.' },
            instance: { type: 'string', example: '/api/v1/files/upload' },
            timestamp: { type: 'string', format: 'date-time', example: '2026-07-27T21:20:00.000Z' },
          },
        },
      },
    },
    paths: {
      '/files/upload': {
        post: {
          summary: 'Upload a file and enqueue background processing job',
          tags: ['Files'],
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['file'],
                  properties: {
                    file: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'File uploaded and job queued successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'File uploaded and job queued successfully' },
                      data: { $ref: '#/components/schemas/FileUploadResponse' },
                    },
                  },
                },
              },
            },
            400: { description: 'Invalid file format or size exceeds 20MB' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/files/{id}/status': {
        get: {
          summary: 'Get background job processing status for file',
          tags: ['Files'],
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: {
              description: 'Current file status (UPLOADED, PROCESSING, COMPLETED, FAILED)',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/FileStatusResponse' },
                    },
                  },
                },
              },
            },
            404: { description: 'File not found' },
          },
        },
      },
      '/files': {
        get: {
          summary: 'List user uploaded files',
          tags: ['Files'],
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'List of files owned by user',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/FileMetadata' },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/files/{id}': {
        get: {
          summary: 'Get file metadata by ID',
          tags: ['Files'],
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: {
              description: 'File metadata',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/FileMetadata' },
                    },
                  },
                },
              },
            },
            404: { description: 'File not found' },
          },
        },
        delete: {
          summary: 'Delete file from R2 object storage and database',
          tags: ['Files'],
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: { description: 'File deleted successfully' },
            404: { description: 'File not found' },
          },
        },
      },
      '/files/{id}/download-url': {
        get: {
          summary: 'Generate temporary presigned download URL',
          tags: ['Files'],
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: {
              description: 'Presigned download URL',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/DownloadUrlResponse' },
                    },
                  },
                },
              },
            },
            404: { description: 'File not found' },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
