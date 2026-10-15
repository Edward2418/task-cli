import { afterEach, expect, it } from 'vitest';
import { environment } from '../helpers/environment.js';
const contexts: ReturnType<typeof environment>[] = [];
function setup() { const ctx = environment(); contexts.push(ctx); ctx.seed(); return ctx; }
afterEach(() => contexts.splice(0).forEach(ctx => ctx.cleanup()));
it('avanza, completa y reabre con confirmación', () => {
  const ctx = setup();
  for (const status of ['in-progress', 'done', 'todo']) {
    const result = ctx.run(['status', '1', status]);
    expect(result.status, result.stderr).toBe(0); expect(result.stdout).toContain(status);
  }
});
it.each([['1', 'done'], ['1', 'todo'], ['1', 'unknown'], ['-1', 'todo'], ['999', 'todo']])('rechaza %s → %s', (id, status) => {
  const ctx = setup(); const before = ctx.rows(); const result = ctx.run(['status', id, status]);
  expect(result.status).toBe(1); expect(result.stderr).not.toContain(' at '); expect(ctx.rows()).toEqual(before);
});
