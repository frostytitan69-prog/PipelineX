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
        AdminDashboardStats: {
          type: 'object',
          properties: {
            totalUsers: { type: 'integer', example: 42 },
            totalFiles: { type: 'integer', example: 128 },
            totalJobs: { type: 'integer', example: 128 },
            completedJobs: { type: 'integer', example: 120 },
            failedJobs: { type: 'integer', example: 2 },
            processingJobs: { type: 'integer', example: 6 },
            storageUsedBytes: { type: 'integer', example: 104857600 },
            averageProcessingTimeMs: { type: 'integer', example: 345 },
          },
        },
        AdminQueueStats: {
          type: 'object',
          properties: {
            waiting: { type: 'integer', example: 0 },
            active: { type: 'integer', example: 1 },
            completed: { type: 'integer', example: 120 },
            failed: { type: 'integer', example: 2 },
            delayed: { type: 'integer', example: 0 },
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
        ErrorResponse: {
          type: 'object',
          properties: {
            type: { type: 'string', example: 'https://pipelinex.dev/errors/FORBIDDEN' },
            title: { type: 'string', example: 'Forbidden' },
            status: { type: 'integer', example: 403 },
            detail: { type: 'string', example: 'Forbidden: You do not have sufficient permissions to access this resource' },
            instance: { type: 'string', example: '/api/v1/admin/dashboard' },
            timestamp: { type: 'string', format: 'date-time', example: '2026-07-27T21:20:00.000Z' },
          },
        },
      },
    },
    paths: {
      '/admin/dashboard': {
        get: {
          summary: 'Get admin dashboard statistics (ADMIN only)',
          tags: ['Admin'],
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'Dashboard statistics summary',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/AdminDashboardStats' },
                    },
                  },
                },
              },
            },
            403: { description: 'Forbidden (Requires ADMIN role)' },
          },
        },
      },
      '/admin/queue': {
        get: {
          summary: 'Get BullMQ queue telemetry statistics (ADMIN only)',
          tags: ['Admin'],
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'Queue job counts',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/AdminQueueStats' },
                    },
                  },
                },
              },
            },
            403: { description: 'Forbidden' },
          },
        },
      },
      '/admin/jobs': {
        get: {
          summary: 'List execution jobs with pagination and status filter (ADMIN only)',
          tags: ['Admin'],
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED'] } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          ],
          responses: {
            200: { description: 'Paginated list of jobs' },
            403: { description: 'Forbidden' },
          },
        },
      },
      '/admin/jobs/{jobId}/retry': {
        post: {
          summary: 'Manually retry a failed background job (ADMIN only)',
          tags: ['Admin'],
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'jobId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: { description: 'Job re-queued successfully' },
            403: { description: 'Forbidden' },
            404: { description: 'Job not found' },
          },
        },
      },
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
            201: { description: 'File uploaded and job queued successfully' },
            400: { description: 'Invalid file format' },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
