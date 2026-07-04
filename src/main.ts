import 'reflect-metadata';
import { setupContainer } from '@/infrastructure/di/container';
import { logger } from '@/core/logger/logger';
import { startServer } from '@/server';

setupContainer();

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled promise rejection');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Uncaught exception');
  process.exit(1);
});

void startServer().catch((error: unknown) => {
  logger.fatal({ err: error }, 'Failed to start server');
  process.exit(1);
});
