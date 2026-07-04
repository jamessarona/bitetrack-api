import { env, isDevelopment, isProduction, isTest } from './env';

/**
 * Structured, feature-grouped application configuration.
 * Consume this instead of reading `process.env` directly anywhere else.
 */
export const config = {
  env: env.NODE_ENV,
  isDevelopment,
  isProduction,
  isTest,

  app: {
    name: env.APP_NAME,
    host: env.HOST,
    port: env.PORT,
    apiPrefix: env.API_PREFIX,
    trustProxy: env.TRUST_PROXY,
  },

  logging: {
    level: env.LOG_LEVEL,
  },

  cors: {
    origins:
      env.CORS_ORIGINS === '*'
        ? '*'
        : env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean),
  },

  database: {
    url: env.DATABASE_URL,
  },

  redis: {
    url: env.REDIS_URL,
    password: env.REDIS_PASSWORD,
  },

  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  },

  cookie: {
    secret: env.COOKIE_SECRET,
  },

  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
  },
} as const;

export type AppConfig = typeof config;
