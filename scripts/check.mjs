import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const files = ['server.js', 'scripts/check.mjs'];
for (const directory of ['src', 'public/js', 'test']) {
  for (const file of readdirSync(resolve(root, directory), { recursive: true })) {
    if (file.endsWith('.js')) files.push(`${directory}/${file}`);
  }
}
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', resolve(root, file)], { stdio: 'inherit', windowsHide: true });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(1);
}
console.log(`Syntax checked ${files.length} JavaScript files.`);
