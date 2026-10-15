import { createInterface } from 'node:readline/promises';
import type { Readable, Writable } from 'node:stream';
import type { Task } from '../types.js';
import { userError } from './errors.js';
import { displayText } from './output.js';

export async function confirmDelete(
  task: Pick<Task, 'id' | 'title'>,
  input: Readable & { isTTY?: boolean } = process.stdin,
  output: Writable = process.stderr,
): Promise<boolean> {
  if (!input.isTTY) throw userError('La eliminación requiere una terminal interactiva o --force. Repita la operación con una de esas opciones.');
  const reader = createInterface({ input, output, terminal: false });
  const controller = new AbortController();
  const cancel = () => controller.abort();
  reader.once('close', cancel);
  reader.once('SIGINT', cancel);
  process.once('SIGINT', cancel);
  try {
    const answer = await reader.question(`Tarea ${task.id}: ${displayText(task.title)}\n¿Eliminar esta tarea? [s/N] `, { signal: controller.signal });
    return ['s', 'sí', 'si', 'y', 'yes'].includes(answer.trim().toLowerCase());
  } catch (error) {
    if (controller.signal.aborted) return false;
    throw error;
  } finally {
    process.removeListener('SIGINT', cancel);
    reader.removeListener('close', cancel);
    reader.removeListener('SIGINT', cancel);
    reader.close();
  }
}
