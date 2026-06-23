import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

import { requestIdMiddleware } from './middlewares/request-id.middleware.js';
import { loggerMiddleware } from './middlewares/logger.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { validate } from './middlewares/validation.middleware.js';

import { TrackEventBatchSchema } from './schemas/event.schema.js';
import { ListSessionsSchema, GetSessionParamsSchema } from './schemas/session.schema.js';
import { GetHeatmapSchema } from './schemas/heatmap.schema.js';
import { GetScrollSchema } from './schemas/scroll.schema.js';

import { EventController } from './controllers/event.controller.js';
import { SessionController } from './controllers/session.controller.js';
import { HeatmapController } from './controllers/heatmap.controller.js';
import { FrustrationController } from './controllers/frustration.controller.js';
import { ScrollController } from './controllers/scroll.controller.js';
import { swaggerDocument } from './utils/swagger-spec.js';

const app: Application = express();

// Security and Compression
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*' }));
app.use(compression());
app.use(express.json());

// Serve the compiled Tracker SDK statically
app.use('/sdk', express.static(path.resolve(process.cwd(), '../../packages/tracker-sdk/dist')));

// Serve the demo page statically
app.use('/demo', express.static(path.resolve(process.cwd(), '../../apps/demo-page')));

// Request ID and Logging Middlewares
app.use(requestIdMiddleware);
app.use(loggerMiddleware);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Limit each IP to 10000 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP, please try again after 15 minutes.',
    },
  },
});
app.use('/api', limiter);

/**
 * Health check endpoint.
 */
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(200).json({
    status: 'ok',
    db: dbStatusMap[dbState] || 'unknown',
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    version: '1.0.0',
  });
});

// Swagger UI Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Route Bindings
app.get('/api/live', EventController.getLiveFeed);
app.post('/api/events/batch', validate(TrackEventBatchSchema), EventController.postEventsBatch);
app.get('/api/sessions', validate(ListSessionsSchema), SessionController.getSessions);
app.get('/api/funnel', SessionController.getFunnel);
app.get(
  '/api/sessions/:sessionId/journey',
  validate(GetSessionParamsSchema),
  SessionController.getSessionJourney
);
app.get('/api/heatmap', validate(GetHeatmapSchema), HeatmapController.getHeatmap);
app.get('/api/scroll', validate(GetScrollSchema), ScrollController.getScrollAnalytics);
app.get('/api/scroll/dropoff', validate(GetScrollSchema), ScrollController.getScrollDropoff);

app.get('/api/frustration/summary', FrustrationController.getSummary);
app.get('/api/frustration/elements', FrustrationController.getElements);
app.get('/api/frustration/pages', FrustrationController.getPages);
app.get('/api/frustration/timeline', FrustrationController.getTimeline);
app.get(
  '/api/frustration/heatmap',
  validate(GetHeatmapSchema),
  FrustrationController.getHeatmap
);

// Global Error Handler
import debugRoutes from './routes/debug.routes.js';
app.use('/api/reset', debugRoutes);

app.use(errorHandler);

export default app;
