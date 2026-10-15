import { afterEach, expect, it } from 'vitest';
import { environment } from '../helpers/environment.js';
const contexts: ReturnType<typeof environment>[] = [];
function setup() { const ctx = environment(); contexts.push(ctx); return ctx; }
afterEach(() => contexts.splice(0).forEach(ctx => ctx.cleanup()));
it('muestra tabla con cinco columnas y orden descendente', () => {
  const ctx = setup(); ctx.seed({ title: 'Primera' }); ctx.seed({ title: 'Segunda', priority: 'high' });
  const result = ctx.run(['list']);
  expect(result.status, result.stderr).toBe(0);
  for (const label of ['ID', 'Título', 'Estado', 'Prioridad', 'Creación']) expect(result.stdout).toContain(label);
  expect(result.stdout.indexOf('Segunda')).toBeLessThan(result.stdout.indexOf('Primera'));
  const filtered = ctx.run(['list', '--status', 'todo', '--priority', 'high']);
  expect(filtered.stdout).toContain('Segunda'); expect(filtered.stdout).not.toContain('Primera');
});
it('vacío es éxito y filtro inválido es error', () => {
  const ctx = setup(); expect(ctx.run(['list']).stdout).toContain('No hay tareas');
  expect(ctx.run(['list', '--status', 'unknown']).status).toBe(1);
});
it('neutraliza controles y conserva títulos extensos', () => {
  const ctx = setup(); const title = `Acción\n${'x'.repeat(120)}\u001b[31mfin`;
  ctx.seed({ title }); const result = ctx.run(['list']);
  expect(result.status).toBe(0); expect(result.stdout).not.toContain('\u001b');
  expect(result.stdout).toContain('fin'); expect(ctx.rows()[0].title).toBe(title);
});
