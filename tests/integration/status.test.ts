import { afterEach, expect, it } from 'vitest';
import { environment } from '../helpers/environment.js';
import { changeStatus } from '../../db/tasks.js';
const contexts: ReturnType<typeof environment>[] = [];
function setup() { const ctx = environment(); contexts.push(ctx); return ctx; }
afterEach(() => contexts.splice(0).forEach(ctx => ctx.cleanup()));
it('cambia solo estado y revierte transiciones rechazadas', () => {
  const ctx = setup(); const id = ctx.seed(); const before = ctx.rows()[0]; const db = ctx.open();
  try {
    expect(() => changeStatus(db, id, 'done')).toThrow();
    expect(changeStatus(db, id, 'in-progress')).toEqual({ ...before, status: 'in-progress' });
    expect(() => changeStatus(db, 999, 'todo')).toThrow(/999/);
  } finally { db.close(); }
});
it('dos escritores no aceptan la misma transición sobre estado obsoleto', async () => {
  const ctx = setup(); ctx.seed();
  const results = await Promise.all([ctx.runAsync(['status', '1', 'in-progress']), ctx.runAsync(['status', '1', 'in-progress'])]);
  expect(results.map(result => result.status).sort()).toEqual([0, 1]);
  expect(ctx.rows()[0].status).toBe('in-progress');
});
