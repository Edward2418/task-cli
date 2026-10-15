import type { TaskFilters } from '../types.js';
import { withDatabase } from '../db/connection.js';
import { listTasks } from '../db/tasks.js';
import { parsePriority, parseStatus } from '../utils/validation.js';
import { formatTasks } from '../utils/output.js';

export async function listCommand(filters: TaskFilters): Promise<void> {
  if (filters.status !== undefined) parseStatus(filters.status);
  if (filters.priority !== undefined) parsePriority(filters.priority);
  const tasks = await withDatabase(db => listTasks(db, filters));
  process.stdout.write(`${formatTasks(tasks)}\n`);
}
