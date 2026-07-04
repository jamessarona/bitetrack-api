import { type Request, type Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { config } from '@/config';
import { ok } from '@/core/http/api-response';
import { prisma } from '@/infrastructure/database/prisma';
import { redis } from '@/infrastructure/cache/redis';

/** Liveness: the process is up. Cheap and dependency-free. */
export function liveness(_req: Request, res: Response): void {
  res.status(StatusCodes.OK).json(
    ok({
      status: 'ok',
      service: config.app.name,
      env: config.env,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }),
  );
}

/** Readiness: dependencies (database, cache) are reachable. */
export async function readiness(_req: Request, res: Response): Promise<void> {
  const checks: Record<string, 'up' | 'down'> = { database: 'down', redis: 'down' };

  const [dbResult, redisResult] = await Promise.allSettled([
    prisma.$queryRaw`SELECT 1`,
    redis.ping(),
  ]);

  checks.database = dbResult.status === 'fulfilled' ? 'up' : 'down';
  checks.redis = redisResult.status === 'fulfilled' ? 'up' : 'down';

  const healthy = Object.values(checks).every((state) => state === 'up');
  res
    .status(healthy ? StatusCodes.OK : StatusCodes.SERVICE_UNAVAILABLE)
    .json(ok({ status: healthy ? 'ready' : 'degraded', checks }));
}
