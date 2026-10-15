import Database from 'better-sqlite3';
import { writeFileSync, readFileSync } from 'node:fs';
import { afterEach, expect, it } from 'vitest';
import { environment } from '../helpers/environment.js';
import { createTask, updateTask } from '../../db/tasks.js';
import { errorMessage } from '../../utils/errors.js';
const contexts: ReturnType<typeof environment>[] = [];
function setup() { const ctx = environment(); contexts.push(ctx); ctx.seed(); return ctx; }
afterEach(() => contexts.splice(0).forEach(ctx => ctx.cleanup()));
it('corrupción no borra ni reemplaza el archivo', () => {
  const ctx = setup(); writeFileSync(ctx.path, 'archivo corrupto');
  const result = ctx.run(['list']);
  expect(result.status).toBe(1); expect(result.stderr).toContain('copia válida');
  expect(readFileSync(ctx.path, 'utf8')).toBe('archivo corrupto');
});
it('rechaza almacenamiento de solo lectura sin anunciar éxito', () => {
  const ctx = setup(); const before = ctx.rows(); const db = new Database(ctx.path, { readonly: true });
  try {
    let failure: unknown;
    try { createTask(db, { title: 'No guardar' }); } catch (error) { failure = error; }
    expect(errorMessage(failure)).toMatch(/permisos/);
  } finally { db.close(); }
  expect(ctx.rows()).toEqual(before);
});
it('revierte una edición cuando SQLite aborta la escritura', () => {
  const ctx = setup(); const before = ctx.rows(); const db = ctx.open();
  try {
    db.exec("CREATE TRIGGER fail_update BEFORE UPDATE ON tasks BEGIN SELECT RAISE(ABORT, 'fallo simulado'); END");
    expect(() => updateTask(db, 1, { title: 'No guardar', priority: 'high' })).toThrow();
  } finally { db.close(); }
  expect(ctx.rows()).toEqual(before);
});
it('comunica falta de espacio y revierte la inserción', () => {
  const ctx = setup(); const before = ctx.rows(); const db = ctx.open();
  try {
    const pages = db.pragma('page_count', { simple: true });
    db.pragma(`max_page_count = ${pages}`);
    let failure: unknown;
    try { createTask(db, { title: 'x'.repeat(100000) }); } catch (error) { failure = error; }
    expect(errorMessage(failure)).toContain('espacio');
  } finally { db.close(); }
  expect(ctx.rows()).toEqual(before);
});
it('agota espera de bloqueo sin modificar la tarea', async () => {
  const ctx = setup(); const before = ctx.rows(); const db = ctx.open();
  db.exec('BEGIN IMMEDIATE');
  try {
    const start = performance.now(); const result = await ctx.runAsync(['update', '1', '--title', 'No guardar']);
    expect(result.status).toBe(1); expect(result.stderr).toContain('ocupado');
    expect(performance.now() - start).toBeGreaterThanOrEqual(950);
  } finally { db.exec('ROLLBACK'); db.close(); }
  expect(ctx.rows()).toEqual(before);
});
it('esquema futuro e inaccesibilidad se notifican sin stack trace', () => {
  const ctx = setup(); const db = ctx.open(); db.pragma('user_version = 2'); db.close();
  const result = ctx.run(['add', 'x']);
  expect(result.status).toBe(1); expect(result.stderr).toContain('compatible'); expect(result.stderr).not.toContain(' at ');
  const other = environment(); contexts.push(other);
  writeFileSync(`${other.home}/.task-cli`, 'archivo que bloquea el directorio');
  expect(other.run(['list']).status).toBe(1);
});
