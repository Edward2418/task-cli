import { afterEach, expect, it } from 'vitest';
import { environment } from '../helpers/environment.js';
import { deleteWithConfirmation } from '../../commands/delete.js';
import { createTask } from '../../db/tasks.js';
import type { TaskStatus } from '../../types.js';
const contexts: ReturnType<typeof environment>[] = [];
function setup() { const ctx = environment(); contexts.push(ctx); return ctx; }
afterEach(() => contexts.splice(0).forEach(ctx => ctx.cleanup()));
it.each<TaskStatus>(['todo', 'in-progress', 'done'])('confirma y elimina en %s sin reutilizar ID', async status => {
  const ctx = setup(); const id = ctx.seed({ status }); const db = ctx.open();
  try {
    expect(await deleteWithConfirmation(db, id, false, async () => false)).toBe(false);
    expect(ctx.rows()).toHaveLength(1);
    expect(await deleteWithConfirmation(db, id, false, async task => { expect(db.inTransaction).toBe(false); expect(task.id).toBe(id); return true; })).toBe(true);
    expect(createTask(db, { title: 'posterior' }).id).toBeGreaterThan(id);
  } finally { db.close(); }
});
it('informa si desaparece durante confirmación', async () => {
  const ctx = setup(); const id = ctx.seed(); const db = ctx.open();
  try {
    await expect(deleteWithConfirmation(db, id, false, async () => {
      const other = ctx.open(); other.prepare('DELETE FROM tasks WHERE id = ?').run(id); other.close(); return true;
    })).rejects.toThrow(/No existe/);
  } finally { db.close(); }
});
it('force no invoca confirmación', async () => {
  const ctx = setup(); const id = ctx.seed(); const db = ctx.open();
  try { expect(await deleteWithConfirmation(db, id, true, async () => { throw new Error('no llamar'); })).toBe(true); }
  finally { db.close(); }
});
