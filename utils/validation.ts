import type { CreateTaskInput, UpdateTaskInput, Task, TaskPriority, TaskStatus } from '../types.js';
import { userError } from './errors.js';

export function parseId(value: string): number {
  const id = Number(value);
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(id) || id <= 0) {
    throw userError('El ID debe ser un entero decimal positivo hasta 9007199254740991; por ejemplo, 1.');
  }
  return id;
}

export function parseTitle(value: string): string {
  const title = value.trim();
  if (!title) throw userError('Indique un título no vacío; use comillas si contiene espacios.');
  return title;
}

export function parseStatus(value: string): TaskStatus {
  if (value !== 'todo' && value !== 'in-progress' && value !== 'done') {
    throw userError(`Estado no válido: "${value}". Use uno de: todo, in-progress, done.`);
  }
  return value;
}

export function parsePriority(value: string): TaskPriority {
  if (value !== 'high' && value !== 'medium' && value !== 'low') {
    throw userError(`Prioridad no válida: "${value}". Use una de: high, medium, low.`);
  }
  return value;
}

export function normalizeCreate(input: CreateTaskInput) {
  return {
    title: parseTitle(input.title),
    description: input.description === undefined || input.description === '' ? null : input.description,
    priority: parsePriority(input.priority ?? 'medium'),
  };
}

export function normalizeUpdate(input: UpdateTaskInput): Partial<Pick<Task, 'title' | 'description' | 'priority'>> {
  const result: Partial<Pick<Task, 'title' | 'description' | 'priority'>> = {};
  if (input.title !== undefined) result.title = parseTitle(input.title);
  if (input.description !== undefined) result.description = input.description === '' ? null : input.description;
  if (input.priority !== undefined) result.priority = parsePriority(input.priority);
  if (!Object.keys(result).length) throw userError('Indique al menos --title, --description o --priority para editar la tarea.');
  return result;
}
