import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync, spawn } from 'node:child_process';
import { openDatabase } from '../../db/connection.js';
import type { Task } from '../../types.js';

export const cliPath = fileURLToPath(new URL('../../dist/cli.js', import.meta.url));

export function environment() {
  const root = mkdtempSync(join(tmpdir(), 'task-cli-prueba-'));
  const home = join(root, 'usuario con ácentos');
  const cwd = join(root, 'otro directorio');
  mkdirSync(home);
  mkdirSync(cwd);
  const path = join(home, '.task-cli', 'tasks.db');
  const env = { ...process.env, HOME: home, USERPROFILE: home, NO_COLOR: '1' };
  return {
    root, home, cwd, path, env,
    open: () => openDatabase(path),
    run: (args: string[]) => spawnSync(process.execPath, [cliPath, ...args], { env, cwd, encoding: 'utf8', timeout: 10000 }),
    runAsync: (args: string[]): Promise<{ status: number | null; stdout: string; stderr: string }> => new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [cliPath, ...args], { env, cwd, timeout: 10000 });
      let stdout = ''; let stderr = '';
      child.stdout.on('data', chunk => { stdout += chunk; });
      child.stderr.on('data', chunk => { stderr += chunk; });
      child.on('error', reject);
      child.on('close', status => resolve({ status, stdout, stderr }));
      child.stdin.end();
    }),
    seed: (values: Partial<Task> = {}) => {
      const db = openDatabase(path);
      try {
        return Number(db.prepare('INSERT INTO tasks (title, description, status, priority, created_at) VALUES (?, ?, ?, ?, ?)')
          .run(values.title ?? 'Preparada', values.description ?? null, values.status ?? 'todo', values.priority ?? 'medium', values.createdAt ?? '2026-10-01T00:00:00.000Z').lastInsertRowid);
      } finally { db.close(); }
    },
    rows: () => {
      const db = openDatabase(path);
      try { return db.prepare('SELECT id, title, description, status, priority, created_at AS createdAt FROM tasks ORDER BY id').all() as Task[]; }
      finally { db.close(); }
    },
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };
}
