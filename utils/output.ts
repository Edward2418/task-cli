import { stripVTControlCharacters } from 'node:util';
import Table from 'cli-table3';
import type { Task } from '../types.js';

export function displayText(value: string): string {
  return stripVTControlCharacters(value).replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ');
}

export function writeMessage(message: string, stream: Pick<NodeJS.WritableStream, 'write'> = process.stdout): void {
  stream.write(`${displayText(message)}\n`);
}

export function formatTasks(tasks: Task[]): string {
  if (!tasks.length) return 'No hay tareas que coincidan con la consulta.';
  const table = new Table({
    head: ['ID', 'Título', 'Estado', 'Prioridad', 'Creación'],
    colWidths: [18, 42, 15, 12, 26],
    wordWrap: true,
    wrapOnWordBoundary: false,
    style: { head: [], border: [] },
  });
  for (const task of tasks) table.push([String(task.id), displayText(task.title), task.status, task.priority, task.createdAt]);
  return table.toString();
}
