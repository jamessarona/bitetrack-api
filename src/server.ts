import { createServer, type Server as HttpServer } from 'node:http';
import { type Express } from 'express';
import { type Server as SocketServer } from 'socket.io';
import { createApp } from '@/app';
import { config } from '@/config';
import { logger } from '@/core/logger/logger';
import { connectRedis, disconnectRedis } from '@/infrastructure/cache/redis';
import { connectDatabase, disconnectDatabase } from '@/infrastructure/database/prisma';
import { createSocketServer } from '@/infrastructure/realtime/socket';

export interface RunningServer {
  app: Express;
  httpServer: HttpServer;
  io: SocketServer;
}

export async function startServer(): Promise<RunningServer> {
  await connectDatabase();
  await connectRedis();

  const app = createApp();
  const httpServer = createServer(app);
  const io = createSocketServer(httpServer);

  await new Promise<void>((resolve) => {
    httpServer.listen(config.app.port, config.app.host, resolve);
  });

  logger.info(
    `${config.app.name} listening on http://${config.app.host}:${config.app.port}${config.app.apiPrefix} (${config.env})`,
  );

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'Shutting down');
    void io.close();
    httpServer.close();
    await Promise.allSettled([disconnectDatabase(), disconnectRedis()]);
    process.exit(0);
  };

  for (const signal of ['SIGTERM', 'SIGINT'] as const) {
    process.on(signal, () => {
      void shutdown(signal);
    });
  }

  return { app, httpServer, io };
}
