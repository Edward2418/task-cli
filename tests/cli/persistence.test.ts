import { afterAll, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { cliPath, environment } from '../helpers/environment.js';
const ctx = environment(); afterAll(() => ctx.cleanup());
it('conserva creaciones, ediciones y estados, sin resucitar borrados', () => {
  const commands = [
    ['add', 'Uno'], ['add', 'Dos'], ['update', '1', '--title', 'Editada'],
    ['status', '1', 'in-progress'], ['status', '1', 'done'], ['delete', '2', '--force'],
  ];
  for (const args of commands) { const result = ctx.run(args); expect(result.status, result.stderr).toBe(0); }
  const result = spawnSync(process.execPath, [cliPath, 'list'], { cwd: ctx.root, env: { ...ctx.env, HTTP_PROXY: 'http://127.0.0.1:1', HTTPS_PROXY: 'http://127.0.0.1:1' }, encoding: 'utf8' });
  expect(result.status).toBe(0); expect(result.stdout).toContain('Editada'); expect(result.stdout).toContain('done');
  expect(result.stdout).not.toContain('Dos'); expect(ctx.rows()).toHaveLength(1);
});
