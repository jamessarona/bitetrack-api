import { type Server as HttpServer } from 'node:http';
import { Server as SocketServer } from 'socket.io';
import { config } from '@/config';
import { logger } from '@/core/logger/logger';

export function createSocketServer(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: config.cors.origins === '*' ? true : config.cors.origins,
      credentials: true,
    },
    path: '/realtime',
  });

  io.on('connection', (socket) => {
    logger.debug({ socketId: socket.id }, 'Realtime client connected');
    socket.on('disconnect', (reason) => {
      logger.debug({ socketId: socket.id, reason }, 'Realtime client disconnected');
    });
  });

  return io;
}
