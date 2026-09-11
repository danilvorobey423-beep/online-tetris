import { createGameServer } from './src/server/app.js';
import { readConfig } from './src/server/config.js';

function start() {
  const { host, port } = readConfig();
  const { httpServer, io } = createGameServer();
  let stopping = false;

  httpServer.on('error', (error) => {
    const detail = error.code === 'EADDRINUSE'
      ? 'address already in use; stop the other server or choose another PORT'
      : (error.code ?? 'unknown network error');
    console.error(`[server] Cannot listen on ${host}:${port}: ${detail}`);
    process.exitCode = 1;
    io.close();
  });

  function stop(signal) {
    if (stopping) return;
    stopping = true;
    console.info(`[server] Stopping (${signal})`);
    const deadline = setTimeout(() => {
      console.error('[server] Shutdown timed out');
      process.exit(1);
    }, 5000);
    deadline.unref();
    io.close(() => {
      clearTimeout(deadline);
      console.info('[server] Stopped');
    });
  }

  process.once('SIGINT', () => stop('SIGINT'));
  process.once('SIGTERM', () => stop('SIGTERM'));
  console.info('[server] Starting Online Tetris');
  httpServer.listen(port, host, () => {
    const address = httpServer.address();
    const displayHost = address.family === 'IPv6' ? `[${address.address}]` : address.address;
    console.info(`[server] Listening on http://${displayHost}:${address.port}`);
  });
}

try {
  start();
} catch (error) {
  console.error(`[server] Startup failed: ${error.message}`);
  process.exitCode = 1;
}
