import type Database from 'better-sqlite3';
import { userError } from '../utils/errors.js';

export function initializeSchema(db: Database.Database): void {
  const version = db.pragma('user_version', { simple: true });
  if (typeof version !== 'number' || version > 1) {
    throw userError('El esquema requiere una versión compatible de task-cli. Actualice el CLI sin borrar la base.');
  }
  if (version === 1) return;
  db.transaction(() => {
    db.exec(`CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT CHECK (id > 0 AND id <= 9007199254740991),
      title TEXT NOT NULL CHECK (length(title) > 0),
      description TEXT,
      status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'done')),
      priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
      created_at TEXT NOT NULL
    )`);
    db.pragma('user_version = 1');
  }).immediate();
}
