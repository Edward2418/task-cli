import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import { afterEach, expect, it } from 'vitest';
import { openDatabase } from '../../db/connection.js';

const roots: string[] = [];
function file() {
  const root = mkdtempSync(join(tmpdir(), 'task-cli-conexión-'));
  roots.push(root);
  return join(root, 'usuario', 'tasks.db');
}
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });
it('inicializa y reabre sin perder datos', () => {
  const path = file();
  const db = openDatabase(path);
  expect(db.pragma('user_version', { simple: true })).toBe(1);
  expect(db.pragma('busy_timeout', { simple: true })).toBe(1000);
  db.close();
  const next = openDatabase(path);
  expect(next.prepare('SELECT count(*) AS n FROM tasks').get()).toEqual({ n: 0 });
  next.close();
});
it('rechaza un esquema futuro sin modificarlo', () => {
  const path = file();
  const db = openDatabase(path);
  db.pragma('user_version = 2');
  db.close();
  expect(() => openDatabase(path)).toThrow(/compatible/);
  const check = new Database(path);
  expect(check.pragma('user_version', { simple: true })).toBe(2);
  check.close();
});
it('no reemplaza un archivo corrupto', () => {
  const path = file();
  const db = openDatabase(path);
  db.close();
  writeFileSync(path, 'no es sqlite');
  expect(() => openDatabase(path)).toThrow();
});
