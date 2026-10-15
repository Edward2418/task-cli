import { afterEach, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { cliPath, environment } from '../helpers/environment.js';
const contexts: ReturnType<typeof environment>[] = [];
function setup() { const ctx = environment(); contexts.push(ctx); ctx.seed(); return ctx; }
afterEach(() => contexts.splice(0).forEach(ctx => ctx.cleanup()));
it('force borra sin preguntar y segunda eliminación falla', () => {
  const ctx = setup(); const result = ctx.run(['delete', '1', '--force']);
  expect(result.status, result.stderr).toBe(0); expect(result.stderr).toBe(''); expect(ctx.rows()).toEqual([]);
  expect(ctx.run(['delete', '1', '--force']).status).toBe(1);
});
it('una tubería afirmativa no sustituye force', () => {
  const ctx = setup();
  const result = spawnSync(process.execPath, [cliPath, 'delete', '1'], { env: ctx.env, cwd: ctx.cwd, input: 's\n', encoding: 'utf8', timeout: 3000 });
  expect(result.status).toBe(1); expect(result.stderr).toContain('--force'); expect(ctx.rows()).toHaveLength(1);
});
it.each(['0', '-1', '1.5', 'abc', '999'])('rechaza ID %s', id => {
  const ctx = setup(); expect(ctx.run(['delete', id, '--force']).status).toBe(1); expect(ctx.rows()).toHaveLength(1);
});
