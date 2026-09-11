import assert from 'node:assert/strict';
import { execFile, spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import test from 'node:test';
import { io as connectClient } from 'socket.io-client';
import { createGameServer } from '../src/server/app.js';
import { readConfig } from '../src/server/config.js';

const execFileAsync = promisify(execFile);
const entryPoint = fileURLToPath(new URL('../server.js', import.meta.url));

async function startTestServer(t) {
  const logs = [];
  const server = createGameServer({
    logger: {
      info: (...args) => logs.push(args.join(' ')),
      error: (...args) => logs.push(args.join(' ')),
    },
  });
  server.httpServer.listen(0, '127.0.0.1');
  await once(server.httpServer, 'listening');
  t.after(() => new Promise((resolve) => server.io.close(resolve)));
  return {
    ...server,
    logs,
    port: server.httpServer.address().port,
    url: `http://127.0.0.1:${server.httpServer.address().port}`,
  };
}

function createClient(t, url, transports) {
  const client = connectClient(url, {
    autoConnect: false,
    reconnection: false,
    forceNew: true,
    transports,
  });
  t.after(() => client.disconnect());
  return client;
}

function waitFor(emitter, event) {
  return once(emitter, event, { signal: AbortSignal.timeout(4000) });
}

test('configuration supports defaults and explicit IPv4/IPv6 bindings', () => {
  assert.deepEqual(readConfig({}), { host: '0.0.0.0', port: 3000 });
  assert.deepEqual(readConfig({ HOST: '127.0.0.1', PORT: '3100' }), { host: '127.0.0.1', port: 3100 });
  assert.deepEqual(readConfig({ HOST: '::1', PORT: '65535' }), { host: '::1', port: 65535 });
  assert.deepEqual(readConfig({ HOST: 'localhost', PORT: '1' }), { host: 'localhost', port: 1 });
});

test('invalid ports and URL/pipe bindings are rejected before listening', () => {
  for (const port of ['', '0', '-1', '65536', '3.5', '3000oops', ' 3000', '1e3']) {
    assert.throws(() => readConfig({ PORT: port }), /PORT must/);
  }
  for (const host of ['', ' ', 'http://localhost', 'localhost:3000', '/tmp/tetris.sock', '999.1.1.1']) {
    assert.throws(() => readConfig({ HOST: host }), /HOST must/);
  }
});

test('HTTP serves the game and local assets without exposing the repository', async (t) => {
  const { url } = await startTestServer(t);
  const page = await fetch(url);
  assert.equal(page.status, 200);
  assert.match(page.headers.get('content-type'), /text\/html/);
  assert.match(await page.text(), /ONLINE <span>TETRIS/);
  assert.equal(page.headers.get('x-powered-by'), null);

  for (const path of ['/css/main.css', '/js/main.js', '/favicon.svg', '/socket.io/socket.io.js', '/shared/game.js', '/shared/pieces.js', '/shared/constants.js']) {
    const response = await fetch(url + path);
    assert.equal(response.status, 200, path);
    await response.arrayBuffer();
  }
  for (const path of ['/package.json', '/AGENTS.md', '/.env', '/.git/config', '/missing', '/src/server/app.js', '/shared/../server/app.js']) {
    const response = await fetch(url + path);
    assert.equal(response.status, 404, path);
    assert.equal(await response.text(), 'Not found.');
  }
});

test('malformed HTTP paths return a safe error and the server remains available', async (t) => {
  const { url } = await startTestServer(t);
  const response = await fetch(`${url}/%E0%A4%A`);
  assert.equal(response.status, 404);
  assert.equal(await response.text(), 'Not found.');
  assert.equal((await fetch(url)).status, 200);
});

for (const transport of ['polling', 'websocket']) {
  test(`two independent ${transport} clients receive status and disconnect cleanly`, async (t) => {
    const { io, url, logs } = await startTestServer(t);
    const first = createClient(t, url, [transport]);
    const second = createClient(t, url, [transport]);
    const firstStatus = waitFor(first, 'server:status');
    const secondStatus = waitFor(second, 'server:status');
    first.connect();
    second.connect();
    assert.deepEqual(await firstStatus, [{ status: 'connected' }]);
    assert.deepEqual(await secondStatus, [{ status: 'connected' }]);
    assert.notEqual(first.id, second.id);
    assert.equal(io.sockets.sockets.size, 2);

    const disconnected = waitFor(io.sockets.sockets.get(first.id), 'disconnect');
    first.disconnect();
    await disconnected;
    assert.equal(io.sockets.sockets.size, 1);
    assert.equal(second.connected, true);
    assert.ok(logs.some((line) => line.includes('[socket] Disconnected')));
  });
}

test('oversized socket messages disconnect the sender without stopping the server', async (t) => {
  const { url, io } = await startTestServer(t);
  const client = createClient(t, url, ['websocket']);
  const ready = waitFor(client, 'server:status');
  client.connect();
  await ready;
  const disconnected = waitFor(client, 'disconnect');
  client.emit('unknown:event', 'x'.repeat(20 * 1024));
  await disconnected;
  assert.equal(io.sockets.sockets.size, 0);
  assert.equal((await fetch(url)).status, 200);
});

test('server shutdown notifies connected clients', async (t) => {
  const { url, io } = await startTestServer(t);
  const client = createClient(t, url, ['websocket']);
  const ready = waitFor(client, 'server:status');
  client.connect();
  await ready;
  const disconnected = waitFor(client, 'disconnect');
  await new Promise((resolve) => io.close(resolve));
  await disconnected;
  assert.equal(client.connected, false);
  assert.equal(io.sockets.sockets.size, 0);
});

test('the real entry point exits clearly when its configured address is occupied', async (t) => {
  const { port } = await startTestServer(t);
  await assert.rejects(execFileAsync(process.execPath, [entryPoint], {
    env: { ...process.env, HOST: '127.0.0.1', PORT: String(port) },
    timeout: 5000,
    windowsHide: true,
  }), (error) => {
    assert.equal(error.code, 1);
    assert.match(error.stderr, /address already in use/);
    return true;
  });
});

test('the real entry point rejects invalid environment configuration', async () => {
  await assert.rejects(execFileAsync(process.execPath, [entryPoint], {
    env: { ...process.env, PORT: '3000invalid' },
    timeout: 5000,
    windowsHide: true,
  }), (error) => {
    assert.equal(error.code, 1);
    assert.match(error.stderr, /Startup failed: PORT must/);
    return true;
  });
});

test('the CLI serves from another directory and shuts down cleanly on SIGTERM', {
  skip: process.platform === 'win32' ? 'Requires Unix signal delivery; run in Ubuntu/WSL.' : false,
  timeout: 10000,
}, async (t) => {
  const reservation = createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const port = reservation.address().port;
  await new Promise((resolve) => reservation.close(resolve));

  const child = spawn(process.execPath, [entryPoint], {
    cwd: tmpdir(),
    env: { ...process.env, HOST: '127.0.0.1', PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  t.after(() => {
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
  });
  let output = '';
  let errors = '';
  child.stderr.on('data', (chunk) => { errors += chunk; });
  const exited = once(child, 'exit');
  const ready = new Promise((resolve) => {
    child.stdout.on('data', (chunk) => {
      output += chunk;
      if (output.includes('[server] Listening on')) resolve();
    });
  });
  await Promise.race([
    ready,
    exited.then(() => { throw new Error(`Server exited before listening: ${errors}`); }),
  ]);

  const url = `http://127.0.0.1:${port}`;
  assert.equal((await fetch(url)).status, 200);
  assert.match(output, new RegExp(`Listening on http://127\\.0\\.0\\.1:${port}`));
  const client = createClient(t, url, ['websocket']);
  const status = waitFor(client, 'server:status');
  client.connect();
  await status;
  const disconnected = waitFor(client, 'disconnect');
  assert.equal(child.kill('SIGTERM'), true);
  await disconnected;
  assert.deepEqual(await exited, [0, null]);
  assert.match(output, /Stopping \(SIGTERM\)/);
  assert.match(output, /\[server\] Stopped/);
  assert.equal(errors, '');
});
