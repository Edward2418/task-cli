import { afterEach, expect, it } from 'vitest';
import { environment } from '../helpers/environment.js';
import { createTask } from '../../db/tasks.js';
const ctx = environment();
afterEach(() => { const db = ctx.open(); db.prepare('DELETE FROM tasks').run(); db.close(); });
import { afterAll } from 'vitest';
afterAll(() => ctx.cleanup());
it('no reutiliza IDs y conserva fecha exacta y descripción', () => {
  const db = ctx.open();
  try {
    const task = createTask(db, { title: ' repetida ', description: '  ', priority: 'low' }, () => new Date('2026-10-01T00:00:00.000Z'));
    expect(task).toMatchObject({ title: 'repetida', description: '  ', priority: 'low', status: 'todo', createdAt: '2026-10-01T00:00:00.000Z' });
    db.prepare('DELETE FROM tasks WHERE id = ?').run(task.id);
    expect(createTask(db, { title: 'repetida', description: '' }).id).toBeGreaterThan(task.id);
    expect(createTask(db, { title: 'repetida' }).description).toBeNull();
  } finally { db.close(); }
});
it('revierte inserciones fuera del rango seguro', () => {
  const db = ctx.open();
  try {
    createTask(db, { title: 'previa' });
    db.prepare("UPDATE sqlite_sequence SET seq = ? WHERE name = 'tasks'").run(Number.MAX_SAFE_INTEGER);
    expect(() => createTask(db, { title: 'no guardar' })).toThrow();
    expect(db.prepare('SELECT count(*) AS n FROM tasks').get()).toEqual({ n: 1 });
    db.prepare("UPDATE sqlite_sequence SET seq = 100 WHERE name = 'tasks'").run();
  } finally { db.close(); }
});
it('conserva la tarea al abrir otro proceso y directorio', () => {
  const result = ctx.run(['add', 'Persistente']);
  expect(result.status).toBe(0);
  expect(ctx.rows().some(task => task.title === 'Persistente')).toBe(true);
});
