import { isIP } from 'node:net';

export function readConfig(env = process.env) {
  const host = env.HOST ?? '0.0.0.0';
  const rawPort = env.PORT ?? '3000';

  // Binding accepts a literal IP or localhost, never a URL or a pipe path.
  if (typeof host !== 'string' || (!isIP(host) && host !== 'localhost')) {
    throw new Error('HOST must be an IPv4/IPv6 address or localhost.');
  }

  if (typeof rawPort !== 'string' || !/^\d+$/.test(rawPort)) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  const port = Number(rawPort);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  return { host, port };
}
