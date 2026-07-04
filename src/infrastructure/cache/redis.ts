import { Redis } from 'ioredis';
import { config } from '@/config';
import { logger } from '@/core/logger/logger';

export const redis = new Redis(config.redis.url, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  lazyConnect: true,
  ...(config.redis.password ? { password: config.redis.password } : {}),
});

redis.on('error', (error: Error) => {
  logger.error({ err: error }, 'Redis connection error');
});

redis.on('connect', () => {
  logger.info('Redis connection established');
});

export async function connectRedis(): Promise<void> {
  if (redis.status === 'ready' || redis.status === 'connecting') {
    return;
  }
  await redis.connect();
}

export async function disconnectRedis(): Promise<void> {
  if (redis.status === 'end') {
    return;
  }
  await redis.quit();
  logger.info('Redis connection closed');
}
