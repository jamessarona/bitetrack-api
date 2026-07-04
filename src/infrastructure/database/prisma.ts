import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { config } from '@/config';
import { logger } from '@/core/logger/logger';

/**
 * Prisma 7 requires a driver adapter. We use node-postgres (`pg`) over TCP.
 * Timeouts are set explicitly because v7 driver-adapter defaults differ from
 * the historical v6 behaviour.
 */
const adapter = new PrismaPg({
  connectionString: config.database.url,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 300_000,
});

const createPrismaClient = (): PrismaClient =>
  new PrismaClient({
    adapter,
    log: config.isDevelopment ? ['query', 'warn', 'error'] : ['warn', 'error'],
  });

// Reuse a single client across hot-reloads in development to avoid exhausting
// the connection pool.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (config.isDevelopment) {
  globalForPrisma.prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  logger.info('Database connection established');
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Database connection closed');
}
