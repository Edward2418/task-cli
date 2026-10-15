import type Database from 'better-sqlite3';
import type { Task } from '../types.js';
import { withDatabase } from '../db/connection.js';
import { deleteTask, getTask } from '../db/tasks.js';
import { parseId } from '../utils/validation.js';
import { writeMessage } from '../utils/output.js';
import { confirmDelete } from '../utils/confirmation.js';

export async function deleteWithConfirmation(
  db: Database.Database, id: number, force: boolean,
  confirm: (task: Task) => Promise<boolean> = confirmDelete,
): Promise<boolean> {
  const task = getTask(db, id);
  if (!force && !await confirm(task)) return false;
  deleteTask(db, id);
  return true;
}

export async function deleteCommand(idValue: string, force = false): Promise<void> {
  const id = parseId(idValue);
  const deleted = await withDatabase(db => deleteWithConfirmation(db, id, force));
  writeMessage(deleted ? `Tarea ${id} eliminada.` : `Eliminación de la tarea ${id} cancelada.`);
}
