import { withDatabase } from '../db/connection.js';
import { changeStatus } from '../db/tasks.js';
import { parseId, parseStatus } from '../utils/validation.js';
import { writeMessage } from '../utils/output.js';

export async function statusCommand(idValue: string, statusValue: string): Promise<void> {
  const id = parseId(idValue); const status = parseStatus(statusValue);
  const task = await withDatabase(db => changeStatus(db, id, status));
  writeMessage(`Tarea ${task.id}: estado actualizado a ${task.status}.`);
}
