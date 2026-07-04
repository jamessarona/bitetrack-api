import { rateLimit } from 'express-rate-limit';
import { RedisStore, type RedisReply } from 'rate-limit-redis';
import { config } from '@/config';
import { fail } from '@/core/http/api-response';
import { redis } from '@/infrastructure/cache/redis';

export const apiRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.max,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: new RedisStore({
    prefix: 'ratelimit:',
    sendCommand: (...args: string[]): Promise<RedisReply> =>
      redis.call(args[0]!, ...args.slice(1)) as Promise<RedisReply>,
  }),
  handler: (_req, res) => {
    res.status(429).json(fail('TOO_MANY_REQUESTS', 'Too many requests, please slow down.'));
  },
});
