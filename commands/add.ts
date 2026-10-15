import type { CreateTaskInput } from '../types.js';
import { withDatabase } from '../db/connection.js';
import { createTask } from '../db/tasks.js';
import { normalizeCreate } from '../utils/validation.js';
import { writeMessage } from '../utils/output.js';

export async function addCommand(input: CreateTaskInput): Promise<void> {
  normalizeCreate(input);
  const task = await withDatabase(db => createTask(db, input));
  writeMessage(`Tarea ${task.id} creada: ${task.title} | ${task.status} | ${task.priority} | ${task.createdAt}${task.description === null ? '' : ` | Descripción: ${task.description}`}`);
}
