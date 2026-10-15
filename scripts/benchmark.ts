import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir, cpus, release } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { openDatabase } from '../db/connection.js';

const root = mkdtempSync(join(tmpdir(), 'task-cli-benchmark-'));
const cli = fileURLToPath(new URL('../dist/cli.js', import.meta.url));
try {
  const db = openDatabase(join(root, '.task-cli/tasks.db'));
  try {
    const insert = db.prepare('INSERT INTO tasks(title, status, priority, created_at) VALUES (?, ?, ?, ?)');
    db.transaction(() => {
      for (let i = 1; i <= 1000; i++) insert.run(`Tarea-${String(i).padStart(4, '0')}`, 'todo', 'medium', '2026-10-01T00:00:00.000Z');
    })();
  } finally { db.close(); }
  const samples: number[] = [];
  for (let i = 0; i < 100; i++) {
    const start = performance.now();
    const result = spawnSync(process.execPath, [cli, 'list'], {
      env: { ...process.env, HOME: root, USERPROFILE: root, NO_COLOR: '1' }, cwd: root,
      encoding: 'utf8', timeout: 10000, maxBuffer: 8 * 1024 * 1024,
    });
    samples.push(performance.now() - start);
    assert.equal(result.status, 0, result.stderr);
    const ids = [...result.stdout.matchAll(/│\s*(\d+)\s*│\s*Tarea-(\d+)\s*│\s*todo\s*│\s*medium\s*│\s*2026-10-01T00:00:00\.000Z\s*│/g)].map(match => {
      assert.equal(Number(match[1]), Number(match[2])); return Number(match[1]);
    });
    assert.deepEqual(ids, Array.from({ length: 1000 }, (_, index) => 1000 - index));
  }
  const p95 = [...samples].sort((a, b) => a - b)[94];
  const passing = samples.filter(value => value < 1000).length;
  const report = `# Rendimiento SC-002\n\nFecha de ejecución: ${new Date().toISOString()}\n\n- Plataforma: ${process.platform} ${release()} ${process.arch}\n- CPU: ${cpus()[0]?.model}\n- Node: ${process.version}\n- Tareas: 1.000; listados: 100; exactitud: 100/100.\n- Listados inferiores a 1 s: ${passing}/100.\n- Percentil 95: ${p95.toFixed(2)} ms.\n- Resultado: ${passing >= 95 ? 'APROBADO' : 'NO APROBADO'}.\n- Medición desde lanzamiento hasta salida completa, sin descartar calentamientos.\n`;
  const directory = fileURLToPath(new URL('../specs/001-gestionar-tareas/validation/', import.meta.url));
  mkdirSync(directory, { recursive: true }); writeFileSync(join(directory, 'performance.md'), report);
  console.log(report);
  if (passing < 95) process.exitCode = 1;
} finally { rmSync(root, { recursive: true, force: true }); }
