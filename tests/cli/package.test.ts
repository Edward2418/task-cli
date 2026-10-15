import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { expect, it } from 'vitest';
import { environment } from '../helpers/environment.js';

it('instala el tarball global y ejecuta el lanzador nativo con SQLite', () => {
  const ctx = environment();
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const staging = join(ctx.root, 'paquete'); const prefix = join(ctx.root, 'instalación global');
  mkdirSync(staging); mkdirSync(prefix);
  const npm = process.env.npm_execpath?.replace(/npx-cli\.js$/, 'npm-cli.js') ?? join(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
  try {
    cpSync(join(root, 'dist'), join(staging, 'dist'), { recursive: true });
    const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    writeFileSync(join(staging, 'package.json'), JSON.stringify(manifest));
    const pack = spawnSync(process.execPath, [npm, 'pack', '--ignore-scripts', '--json'], { cwd: staging, encoding: 'utf8', timeout: 30000 });
    expect(pack.status, pack.stderr).toBe(0);
    const metadata = JSON.parse(pack.stdout)[0];
    expect(metadata.files.every((entry: { path: string }) => entry.path === 'package.json' || entry.path.startsWith('dist/'))).toBe(true);
    const install = spawnSync(process.execPath, [npm, 'install', '--global', '--prefix', prefix, '--omit=dev', join(staging, metadata.filename)], { cwd: ctx.cwd, encoding: 'utf8', timeout: 90000 });
    expect(install.status, install.stderr).toBe(0);
    const modulePath = process.platform === 'win32' ? join(prefix, 'node_modules/task-cli') : join(prefix, 'lib/node_modules/task-cli');
    for (const dep of ['typescript', 'tsx', 'vitest']) expect(existsSync(join(modulePath, 'node_modules', dep))).toBe(false);
    const shim = process.platform === 'win32' ? join(prefix, 'task-cli.cmd') : join(prefix, 'bin/task-cli');
    const run = (args: string[]) => process.platform === 'win32'
      ? spawnSync(`"${shim}" ${args.join(' ')}`, { shell: true, env: ctx.env, cwd: ctx.cwd, encoding: 'utf8', timeout: 10000 })
      : spawnSync(shim, args, { env: ctx.env, cwd: ctx.cwd, encoding: 'utf8', timeout: 10000 });
    expect(run(['--help']).status).toBe(0); expect(existsSync(ctx.path)).toBe(false);
    const add = run(['add', 'Instalada']); expect(add.status, add.stderr).toBe(0);
    expect(run(['list']).stdout).toContain('Instalada'); expect(ctx.rows()[0].title).toBe('Instalada');
  } finally { ctx.cleanup(); }
}, 120000);
