import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { initializeSchema } from './schema.js';

export function openDatabase(path = join(homedir(), '.task-cli', 'tasks.db')): Database.Database {
  mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path, { timeout: 1000 });
  try {
    initializeSchema(db);
    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}

export async function withDatabase<T>(action: (db: Database.Database) => T | Promise<T>): Promise<T> {
  const db = openDatabase();
  try {
    return await action(db);
  } finally {
    db.close();
  }
}
