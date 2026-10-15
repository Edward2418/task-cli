import type Database from 'better-sqlite3';
import type { CreateTaskInput, UpdateTaskInput, Task, TaskFilters } from '../types.js';
import { normalizeCreate, normalizeUpdate, parseStatus, parsePriority } from '../utils/validation.js';
import { userError } from '../utils/errors.js';
import { assertTransition } from '../utils/transitions.js';

const columns = 'id, title, description, status, priority, created_at AS createdAt';

export function getTask(db: Database.Database, id: number): Task {
  const task = db.prepare(`SELECT ${columns} FROM tasks WHERE id = ?`).get(id) as Task | undefined;
  if (!task) throw userError(`No existe la tarea ${id}. Consulte task-cli list para ver los IDs disponibles.`);
  return task;
}

export function deleteTask(db: Database.Database, id: number): void {
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  if (!result.changes) throw userError(`No existe la tarea ${id}. Consulte task-cli list para ver los IDs disponibles.`);
}

export function changeStatus(db: Database.Database, id: number, value: string): Task {
  const status = parseStatus(value);
  return db.transaction(() => {
    const task = getTask(db, id);
    assertTransition(task.status, status);
    db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(status, id);
    return { ...task, status };
  }).immediate();
}

export function updateTask(db: Database.Database, id: number, input: UpdateTaskInput): Task {
  const value = normalizeUpdate(input);
  const keys = (['title', 'description', 'priority'] as const).filter(key => Object.hasOwn(value, key));
  return db.transaction(() => {
    getTask(db, id);
    db.prepare(`UPDATE tasks SET ${keys.map(key => `${key} = ?`).join(', ')} WHERE id = ?`)
      .run(...keys.map(key => value[key]), id);
    return getTask(db, id);
  }).immediate();
}

export function listTasks(db: Database.Database, filters: TaskFilters = {}): Task[] {
  const conditions: string[] = [];
  const params: string[] = [];
  if (filters.status !== undefined) { conditions.push('status = ?'); params.push(parseStatus(filters.status)); }
  if (filters.priority !== undefined) { conditions.push('priority = ?'); params.push(parsePriority(filters.priority)); }
  return db.prepare(`SELECT ${columns} FROM tasks${conditions.length ? ` WHERE ${conditions.join(' AND ')}` : ''} ORDER BY created_at DESC, id DESC`).all(...params) as Task[];
}

export function createTask(db: Database.Database, input: CreateTaskInput, clock = () => new Date()): Task {
  const value = normalizeCreate(input);
  return db.transaction(() => {
    const result = db.prepare('INSERT INTO tasks (title, description, priority, created_at) VALUES (?, ?, ?, ?)')
      .run(value.title, value.description, value.priority, clock().toISOString());
    return db.prepare(`SELECT ${columns} FROM tasks WHERE id = ?`).get(result.lastInsertRowid) as Task;
  }).immediate();
}
