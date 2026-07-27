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
        AuthTokensResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/UserResponse' },
            accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          },
        },
        RegisterInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'developer@pipelinex.dev' },
            password: { type: 'string', minLength: 8, example: 'SecureP@ssw0rd123' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'developer@pipelinex.dev' },
            password: { type: 'string', example: 'SecureP@ssw0rd123' },
          },
        },
        RefreshTokenInput: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            type: { type: 'string', example: 'https://pipelinex.dev/errors/VALIDATION_ERROR' },
            title: { type: 'string', example: 'Validation Error' },
            status: { type: 'integer', example: 400 },
            detail: { type: 'string', example: 'Validation failed: email: Invalid email address format' },
            instance: { type: 'string', example: '/api/v1/auth/register' },
            timestamp: { type: 'string', format: 'date-time', example: '2026-07-27T20:50:00.000Z' },
          },
        },
      },
    },
    paths: {
      '/auth/register': {
        post: {
          summary: 'Register a new user account',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterInput' },
              },
            },
          },
          responses: {
            201: {
              description: 'User registered successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'User registered successfully' },
                      data: { $ref: '#/components/schemas/AuthTokensResponse' },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation failure', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            409: { description: 'Email already registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/auth/login': {
        post: {
          summary: 'User login',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginInput' },
              },
            },
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Login successful' },
                      data: { $ref: '#/components/schemas/AuthTokensResponse' },
                    },
                  },
                },
              },
            },
            401: { description: 'Invalid email or password', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/auth/refresh': {
        post: {
          summary: 'Refresh access token',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RefreshTokenInput' },
              },
            },
          },
          responses: {
            200: {
              description: 'Token refreshed successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Token refreshed successfully' },
                      data: {
                        type: 'object',
                        properties: { accessToken: { type: 'string' } },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Invalid or revoked refresh token' },
          },
        },
      },
      '/auth/logout': {
        post: {
          summary: 'Logout user and revoke refresh token',
          tags: ['Authentication'],
          security: [{ BearerAuth: [] }],
          responses: {
            200: { description: 'Logout successful' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/auth/me': {
        get: {
          summary: 'Get current user profile',
          tags: ['Authentication'],
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'Authenticated user profile',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/UserResponse' },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
