import type { TaskStatus } from '../types.js';
import { userError } from './errors.js';

const destinations: Record<TaskStatus, TaskStatus[]> = {
  todo: ['in-progress'],
  'in-progress': ['done', 'todo'],
  done: ['todo'],
};

export function assertTransition(from: TaskStatus, to: TaskStatus): void {
  if (!destinations[from].includes(to)) {
    throw userError(`No se permite cambiar de ${from} a ${to}. Destinos permitidos: ${destinations[from].join(', ')}.`);
  }
}
