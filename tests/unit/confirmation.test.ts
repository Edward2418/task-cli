import { PassThrough } from 'node:stream';
import { expect, it } from 'vitest';
import { confirmDelete } from '../../utils/confirmation.js';

it.each(['s', 'sí', 'si', 'y', 'yes', ' SÍ ', 'YES', 'n', '', 'quizá'])('respuesta %j', async answer => {
  const input = Object.assign(new PassThrough(), { isTTY: true });
  const output = new PassThrough(); let prompt = '';
  output.on('data', chunk => { prompt += chunk; });
  const pending = confirmDelete({ id: 7, title: 'Ejemplo' }, input, output);
  input.write(`${answer}\n`);
  expect(await pending).toBe(['s', 'sí', 'si', 'y', 'yes'].includes(answer.trim().toLowerCase()));
  expect(prompt).toContain('7'); expect(prompt).toContain('Ejemplo'); expect(prompt).toContain('[s/N]');
  input.destroy(); output.destroy();
});
it('EOF cancela y libera listeners', async () => {
  const input = Object.assign(new PassThrough(), { isTTY: true }); const output = new PassThrough();
  const before = process.listenerCount('SIGINT');
  const pending = confirmDelete({ id: 1, title: 'x' }, input, output); input.end();
  expect(await pending).toBe(false); expect(process.listenerCount('SIGINT')).toBe(before);
  output.destroy();
});
it('interrupción cancela y libera lectura', async () => {
  const input = Object.assign(new PassThrough(), { isTTY: true }); const output = new PassThrough();
  const pending = confirmDelete({ id: 1, title: 'x' }, input, output);
  process.emit('SIGINT'); expect(await pending).toBe(false);
  input.destroy(); output.destroy();
});
it('rechaza entrada no interactiva', async () => {
  const input = new PassThrough(); const output = new PassThrough();
  await expect(confirmDelete({ id: 1, title: 'x' }, input, output)).rejects.toThrow(/--force/);
  input.destroy(); output.destroy();
});
