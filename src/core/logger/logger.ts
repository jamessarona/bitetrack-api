import pino, { type LoggerOptions } from 'pino';
import { config } from '@/config';

const baseOptions: LoggerOptions = {
  level: config.logging.level,
  base: { service: config.app.name, env: config.env },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      '*.password',
      '*.passwordHash',
      '*.token',
      '*.accessToken',
      '*.refreshToken',
    ],
    censor: '[redacted]',
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
};

const transport =
  config.isDevelopment && !config.isTest
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
    : undefined;

export const logger = pino(transport ? { ...baseOptions, transport } : baseOptions);

export type Logger = typeof logger;
