import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { config } from '@/config';
import { logger } from '@/core/logger/logger';

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
