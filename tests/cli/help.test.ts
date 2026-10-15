import { existsSync } from 'node:fs';
import { afterEach, expect, it } from 'vitest';
import { environment } from '../helpers/environment.js';

const contexts: ReturnType<typeof environment>[] = [];
afterEach(() => { contexts.splice(0).forEach(ctx => ctx.cleanup()); });
it.each([[], ['--help'], ['--version']].map(args => ({ args })))('ayuda/versión sin almacenamiento: $args', ({ args }) => {
  const ctx = environment(); contexts.push(ctx);
  const result = ctx.run(args);
  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout).toMatch(/Uso:|0\.1\.0/);
  expect(existsSync(ctx.path)).toBe(false);
});
it.each([['desconocido'], ['--desconocido'], ['--help-extra']].map(args => ({ args })))('rechaza uso desconocido: $args', ({ args }) => {
  const ctx = environment(); contexts.push(ctx);
  const result = ctx.run(args);
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('Consulte');
  expect(result.stderr).not.toContain(' at ');
});
