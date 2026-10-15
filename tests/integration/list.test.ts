import { afterAll, expect, it } from 'vitest';
import { environment } from '../helpers/environment.js';
import { listTasks } from '../../db/tasks.js';
import type { TaskStatus, TaskPriority } from '../../types.js';
const ctx = environment();
const statuses: TaskStatus[] = ['todo', 'in-progress', 'done'];
const priorities: TaskPriority[] = ['high', 'medium', 'low'];
for (const status of statuses) for (const priority of priorities) ctx.seed({ status, priority });
afterAll(() => ctx.cleanup());
it('combina los filtros y desempata por ID sin modificar datos', () => {
  const before = ctx.rows(); const db = ctx.open();
  try {
    expect(listTasks(db, {}).map(row => row.id)).toEqual(before.map(row => row.id).reverse());
    for (const status of statuses) {
      expect(listTasks(db, { status })).toHaveLength(3);
      for (const priority of priorities) expect(listTasks(db, { status, priority })).toHaveLength(1);
    }
    for (const priority of priorities) expect(listTasks(db, { priority })).toHaveLength(3);
    expect(() => listTasks(db, { priority: 'urgent' })).toThrow();
  } finally { db.close(); }
  expect(ctx.rows()).toEqual(before);
});
