import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { Server } from 'socket.io';

const publicDirectory = fileURLToPath(new URL('../../public/', import.meta.url));
const MAX_MESSAGE_BYTES = 16 * 1024;

export function createGameServer({ logger = console } = {}) {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, { maxHttpBufferSize: MAX_MESSAGE_BYTES });

  app.disable('x-powered-by');
  app.use((request, response, next) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });
  app.use(express.static(publicDirectory, { dotfiles: 'ignore' }));
  app.use((request, response) => {
    response.status(404).type('text').send('Not found.');
  });
  app.use((error, request, response, next) => {
    logger.error('[http] Request failed', error);
    if (response.headersSent) {
      next(error);
      return;
    }
    const status = error.status === 400 ? 400 : 500;
    response.status(status).type('text').send(status === 400 ? 'Bad request.' : 'Request failed.');
  });

  io.on('connection', (socket) => {
    logger.info(`[socket] Connected ${socket.id}`);
    socket.emit('server:status', { status: 'connected' });
    socket.on('disconnect', (reason) => {
      logger.info(`[socket] Disconnected ${socket.id}: ${reason}`);
    });
    socket.on('error', (error) => {
      logger.error(`[socket] Error ${socket.id}`, error);
    });
  });

  return { httpServer, io };
}
