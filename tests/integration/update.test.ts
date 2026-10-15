import { afterEach, expect, it } from 'vitest';
import { environment } from '../helpers/environment.js';
import { updateTask } from '../../db/tasks.js';
import type { TaskStatus } from '../../types.js';
const contexts: ReturnType<typeof environment>[] = [];
function setup() { const ctx = environment(); contexts.push(ctx); return ctx; }
afterEach(() => contexts.splice(0).forEach(ctx => ctx.cleanup()));
it.each<TaskStatus>(['todo', 'in-progress', 'done'])('edita en %s sin perder campos', status => {
  const ctx = setup(); const id = ctx.seed({ status, description: 'anterior' }); const before = ctx.rows()[0]; const db = ctx.open();
  try {
    expect(updateTask(db, id, { title: 'Nuevo', description: '', priority: 'low' })).toEqual({ ...before, title: 'Nuevo', description: null, priority: 'low' });
    expect(() => updateTask(db, id, { title: 'No guardar', priority: 'urgent' })).toThrow();
    expect(() => updateTask(db, 999, { title: 'x' })).toThrow(/999/);
  } finally { db.close(); }
  expect(ctx.rows()[0].title).toBe('Nuevo');
});
it('dos ediciones de campos distintos se conservan', async () => {
  const ctx = setup(); ctx.seed();
  const results = await Promise.all([ctx.runAsync(['update', '1', '--title', 'Nuevo']), ctx.runAsync(['update', '1', '--priority', 'low'])]);
  expect(results.map(result => result.status)).toEqual([0, 0]);
  expect(ctx.rows()[0]).toMatchObject({ title: 'Nuevo', priority: 'low' });
});
