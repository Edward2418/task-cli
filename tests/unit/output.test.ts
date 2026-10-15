import { expect, it } from 'vitest';
import { displayText, writeMessage, formatTasks } from '../../utils/output.js';

it('neutraliza controles conservando Unicode', () => {
  const original = '\u001b[31mAcción\u001b[0m\nsegunda\tparte';
  expect(displayText(original)).toBe('Acción segunda parte');
  expect(original).toContain('\u001b');
});
it('escribe solo en el stream recibido', () => {
  const chunks: string[] = [];
  writeMessage('Listo', { write: chunk => { chunks.push(String(chunk)); return true; } });
  expect(chunks).toEqual(['Listo\n']);
});
it('tabla vacía explícita y columnas para textos extensos', () => {
  expect(formatTasks([])).toContain('No hay tareas');
  const table = formatTasks([{ id: 1, title: 'x'.repeat(120), status: 'todo', priority: 'low', description: null, createdAt: '2026-10-01T00:00:00.000Z' }]);
  expect(table).toContain('Título');
  expect(table.match(/x/g)).toHaveLength(120);
  expect(table).not.toContain('\u001b');
});
