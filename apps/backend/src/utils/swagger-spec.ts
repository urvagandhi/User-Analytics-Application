export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'CausalFunnel Analytics API',
    version: '1.0.0',
    description: 'API documentation for CausalFunnel analytics tracking, sessions, and heatmaps.',
  },
  servers: [
    {
      url: '/api',
      description: 'Default API Namespace',
    },
  ],
  paths: {
    '/events/batch': {
      post: {
        summary: 'Ingest a batch of user events',
        description: 'Accepts a batch of page view and click events from the client-side tracker SDK.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/TrackingEvent',
                },
              },
            },
          },
        },
        responses: {
          202: {
            description: 'Batch accepted for processing',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        processed: { type: 'integer', example: 5 },
                        failed: { type: 'integer', example: 0 },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation failed',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ValidationError',
                },
              },
            },
          },
        },
      },
    },
    '/sessions': {
      get: {
        summary: 'Get paginated sessions list',
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
            description: 'Page number',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 50, maximum: 100 },
            description: 'Number of items per page',
          },
        ],
        responses: {
          200: {
            description: 'List of sessions',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Session',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/sessions/{sessionId}/journey': {
      get: {
        summary: 'Get session user journey',
        description: 'Retrieves the session metadata along with chronological events in that session.',
        parameters: [
          {
            name: 'sessionId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Unique Session ID',
          },
        ],
        responses: {
          200: {
            description: 'User journey retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        session: { $ref: '#/components/schemas/Session' },
                        events: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/TrackingEvent' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'Session not found',
          },
        },
      },
    },
    '/heatmap': {
      get: {
        summary: 'Get heatmap data for a page URL',
        parameters: [
          {
            name: 'pageUrl',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            description: 'URL of the page to retrieve heatmap coordinates for',
          },
        ],
        responses: {
          200: {
            description: 'List of click coordinates for page heatmap',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/HeatmapPoint',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/health': {
      get: {
        summary: 'API service health check',
        responses: {
          200: {
            description: 'Health metrics',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    db: { type: 'string', example: 'connected' },
                    uptime: { type: 'number', example: 120.4 },
                    memoryUsage: { type: 'object' },
                    version: { type: 'string', example: '1.0.0' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      TrackingEvent: {
        type: 'object',
        properties: {
          sessionId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
          type: { type: 'string', enum: ['page_view', 'click'], example: 'page_view' },
          timestamp: { type: 'integer', example: 1718228392120 },
          pageUrl: { type: 'string', example: 'http://localhost:3000/' },
          userAgent: { type: 'string', example: 'Mozilla/5.0...' },
          // Click event fields
          x: { type: 'number', example: 120 },
          y: { type: 'number', example: 450 },
          viewportWidth: { type: 'number', example: 1920 },
          viewportHeight: { type: 'number', example: 1080 },
          xPct: { type: 'number', example: 6.25 },
          yPct: { type: 'number', example: 41.67 },
        },
        required: ['sessionId', 'type', 'timestamp', 'pageUrl', 'userAgent'],
      },
      Session: {
        type: 'object',
        properties: {
          sessionId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
          userAgent: { type: 'string', example: 'Mozilla/5.0...' },
          startedAt: { type: 'string', format: 'date-time' },
          lastSeen: { type: 'string', format: 'date-time' },
          totalEvents: { type: 'integer', example: 12 },
          pagesVisited: {
            type: 'array',
            items: { type: 'string' },
            example: ['http://localhost:3000/', 'http://localhost:3000/about'],
          },
        },
      },
      HeatmapPoint: {
        type: 'object',
        properties: {
          x: { type: 'number', example: 120 },
          y: { type: 'number', example: 450 },
          xPct: { type: 'number', example: 6.25 },
          yPct: { type: 'number', example: 41.67 },
        },
      },
      ValidationError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Request validation failed' },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    field: { type: 'string', example: 'body[0].sessionId' },
                    message: { type: 'string', example: 'Session ID is required' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
