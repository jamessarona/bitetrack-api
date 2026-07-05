import { env, isDevelopment, isProduction, isTest } from './env';

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
        : env.CORS_ORIGINS.split(',')
            .map((origin) => origin.trim())
            .filter(Boolean),
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

  google: {
    clientIds: parseGoogleClientIds(env.GOOGLE_CLIENT_IDS ?? env.GOOGLE_CLIENT_ID),
  },

  storage: {
    driver: env.STORAGE_DRIVER,
    gcsProjectId: env.GCS_PROJECT_ID,
    gcsBucket: env.GCS_BUCKET ?? 'bitetrack-media-dev',
    gcsKeyFile: env.GCS_KEY_FILE,
    publicBaseUrl: env.GCS_PUBLIC_BASE_URL,
    uploadUrlTtlMs: env.STORAGE_UPLOAD_URL_TTL_MS,
    s3Bucket: env.AWS_S3_BUCKET_NAME ?? '',
    s3AccessKeyId: env.AWS_S3_ACCESS_KEY_ID ?? '',
    s3SecretAccessKey: env.AWS_S3_SECRET_ACCESS_KEY ?? '',
    s3Region: env.AWS_S3_REGION,
    s3PublicBaseUrl: env.AWS_S3_BASE_URL ?? '',
  },
} as const;

function parseGoogleClientIds(value?: string): string[] {
  if (!value?.trim()) return [];
  return value
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

export type AppConfig = typeof config;
