import dotenv from 'dotenv';
import path from 'path';

// Load env files from root or local workspace folder
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import app from './app.js';
import mongoose from 'mongoose';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/causal_funnel';

async function startServer(): Promise<void> {
  try {
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    logger.info('MongoDB connected successfully.');

    app.listen(PORT, () => {
      logger.info(`Backend server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(error as Error, 'Failed to start server');
    process.exit(1);
  }
}

// Log unexpected promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled Rejection at Promise');
});

// Log and exit on uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error(error, 'Uncaught Exception thrown');
  process.exit(1);
});

startServer();
