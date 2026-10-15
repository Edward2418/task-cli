import { afterEach, expect, it } from 'vitest';
import { environment } from '../helpers/environment.js';
const contexts: ReturnType<typeof environment>[] = [];
function setup() { const ctx = environment(); contexts.push(ctx); ctx.seed({ description: 'antes' }); return ctx; }
afterEach(() => contexts.splice(0).forEach(ctx => ctx.cleanup()));
it('edita varios campos y borra descripción con argumento vacío', () => {
  const ctx = setup(); const result = ctx.run(['update', '1', '--title', 'Título nuevo', '--description', '', '--priority', 'high']);
  expect(result.status, result.stderr).toBe(0); expect(result.stdout).toContain('sin descripción');
  expect(ctx.rows()[0]).toMatchObject({ title: 'Título nuevo', description: null, priority: 'high' });
});
it.each([
  ['update', '1'], ['update', '1', '--title'], ['update', '1', '--title', ' '],
  ['update', '1', '--title', 'no guardar', '--priority', 'urgent'],
  ['update', '999', '--title', 'nuevo'], ['update', '1', '--status', 'done'],
].map(args => ({ args })))('rechaza $args sin cambios', ({ args }) => {
  const ctx = setup(); const before = ctx.rows();
  expect(ctx.run(args).status).toBe(1); expect(ctx.rows()).toEqual(before);
});
