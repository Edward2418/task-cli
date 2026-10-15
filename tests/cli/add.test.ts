import { afterEach, expect, it } from 'vitest';
import { environment } from '../helpers/environment.js';
const contexts: ReturnType<typeof environment>[] = [];
function setup() { const ctx = environment(); contexts.push(ctx); return ctx; }
afterEach(() => contexts.splice(0).forEach(ctx => ctx.cleanup()));
it('crea valores predeterminados y título con guion', () => {
  const ctx = setup();
  const result = ctx.run(['add', '--', '-Título']);
  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout).toMatch(/1.*-Título.*todo.*medium/);
  expect(ctx.rows()[0]).toMatchObject({ id: 1, title: '-Título', status: 'todo', priority: 'medium', description: null });
});
it('acepta descripción y prioridad explícita', () => {
  const ctx = setup();
  expect(ctx.run(['add', '  Acción  doble ', '--description', 'detalle', '--priority', 'high']).status).toBe(0);
  expect(ctx.rows()[0]).toMatchObject({ title: 'Acción  doble', description: 'detalle', priority: 'high' });
});
it.each([['add'], ['add', ' '], ['add', 'x', '--priority', 'urgent'], ['add', 'x', 'extra'], ['add', 'x', '--description']].map(args => ({ args })))('rechaza $args sin insertar', ({ args }) => {
  const ctx = setup(); const result = ctx.run(args);
  expect(result.status).toBe(1); expect(result.stderr).not.toContain(' at ');
  expect(ctx.rows()).toEqual([]);
});
