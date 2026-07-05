import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

function loadDotenvFiles(): void {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const candidates = [`.env.${nodeEnv}`, '.env'];

  for (const file of candidates) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      dotenv.config({ path: fullPath, override: false });
    }
  }
}

loadDotenvFiles();

const booleanFromString = z.enum(['true', 'false']).transform((value) => value === 'true');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  APP_NAME: z.string().min(1).default('bitetrack-api'),
  HOST: z.string().min(1).default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.string().startsWith('/').default('/api/v1'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent']).default('info'),

  CORS_ORIGINS: z.string().default('*'),

  DATABASE_URL: z.string().url(),

  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  REDIS_PASSWORD: z.string().optional(),

  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  JWT_ISSUER: z.string().default('bitetrack'),
  JWT_AUDIENCE: z.string().default('bitetrack-clients'),

  COOKIE_SECRET: z.string().min(16),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),

  TRUST_PROXY: booleanFromString.default(false),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_IDS: z.string().optional(),

  STORAGE_DRIVER: z.enum(['s3', 'gcs']).default('s3'),
  GCS_PROJECT_ID: z.string().optional(),
  GCS_BUCKET: z.string().optional(),
  GCS_KEY_FILE: z.string().optional(),
  GCS_PUBLIC_BASE_URL: z.string().url().default('https://storage.googleapis.com'),
  STORAGE_UPLOAD_URL_TTL_MS: z.coerce.number().int().positive().default(900_000),

  AWS_S3_BUCKET_NAME: z.string().optional(),
  AWS_S3_ACCESS_KEY_ID: z.string().optional(),
  AWS_S3_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_REGION: z.string().default('us-west-1'),
  AWS_S3_BASE_URL: z.string().url().optional(),
}).superRefine((values, ctx) => {
  if (values.NODE_ENV === 'test') {
    return;
  }

  if (values.STORAGE_DRIVER === 's3') {
    if (!values.AWS_S3_BUCKET_NAME?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['AWS_S3_BUCKET_NAME'],
        message: 'AWS_S3_BUCKET_NAME is required when STORAGE_DRIVER=s3',
      });
    }
    if (!values.AWS_S3_ACCESS_KEY_ID?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['AWS_S3_ACCESS_KEY_ID'],
        message: 'AWS_S3_ACCESS_KEY_ID is required when STORAGE_DRIVER=s3',
      });
    }
    if (!values.AWS_S3_SECRET_ACCESS_KEY?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['AWS_S3_SECRET_ACCESS_KEY'],
        message: 'AWS_S3_SECRET_ACCESS_KEY is required when STORAGE_DRIVER=s3',
      });
    }
    if (!values.AWS_S3_BASE_URL?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['AWS_S3_BASE_URL'],
        message: 'AWS_S3_BASE_URL is required when STORAGE_DRIVER=s3',
      });
    }
  }

  if (values.STORAGE_DRIVER === 'gcs' && !values.GCS_BUCKET?.trim()) {
    ctx.addIssue({
      code: 'custom',
      path: ['GCS_BUCKET'],
      message: 'GCS_BUCKET is required when STORAGE_DRIVER=gcs',
    });
  }
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    console.error(`\nInvalid environment configuration:\n${issues}\n`);
    throw new Error('Environment validation failed. See errors above.');
  }

  return parsed.data;
}

export const env: Env = Object.freeze(parseEnv());

export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';
