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
        RateLimitErrorResponse: {
          type: 'object',
          properties: {
            type: { type: 'string', example: 'https://pipelinex.dev/errors/TOO_MANY_REQUESTS' },
            title: { type: 'string', example: 'Too Many Requests' },
            status: { type: 'integer', example: 429 },
            detail: { type: 'string', example: 'Rate limit exceeded. Please try again later.' },
            instance: { type: 'string', example: '/api/v1/files/upload' },
            timestamp: { type: 'string', format: 'date-time', example: '2026-07-27T21:20:00.000Z' },
          },
        },
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
      },
    },
    paths: {
      '/files': {
        get: {
          summary: 'List user uploaded files with pagination, sorting, filtering, and search',
          tags: ['Files'],
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 100 } },
            { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'updatedAt', 'size'], default: 'createdAt' } },
            { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED'] } },
            { name: 'mimeType', in: 'query', schema: { type: 'string', example: 'application/pdf' } },
            { name: 'search', in: 'query', schema: { type: 'string', example: 'report' } },
            { name: 'fromDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
            { name: 'toDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
          ],
          responses: {
            200: { description: 'Paginated file list' },
            400: { description: 'Invalid query parameters' },
            429: { $ref: '#/components/schemas/RateLimitErrorResponse' },
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
            429: { $ref: '#/components/schemas/RateLimitErrorResponse' },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
