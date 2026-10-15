import type { UpdateTaskInput } from '../types.js';
import { withDatabase } from '../db/connection.js';
import { updateTask } from '../db/tasks.js';
import { normalizeUpdate, parseId } from '../utils/validation.js';
import { writeMessage } from '../utils/output.js';

export async function updateCommand(idValue: string, input: UpdateTaskInput): Promise<void> {
  const id = parseId(idValue); normalizeUpdate(input);
  const task = await withDatabase(db => updateTask(db, id, input));
  const fields: string[] = [];
  if (input.title !== undefined) fields.push(`Título: ${task.title}`);
  if (input.description !== undefined) fields.push(`Descripción: ${task.description ?? 'sin descripción'}`);
  if (input.priority !== undefined) fields.push(`Prioridad: ${task.priority}`);
  writeMessage(`Tarea ${id} actualizada | ${fields.join(' | ')}`);
}
