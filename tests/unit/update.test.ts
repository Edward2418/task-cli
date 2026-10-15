import { expect, it } from 'vitest';
import { normalizeUpdate } from '../../utils/validation.js';
it('distingue campo ausente y descripción vacía', () => {
  expect(normalizeUpdate({ title: ' x ' })).toEqual({ title: 'x' });
  expect(normalizeUpdate({ description: '' })).toEqual({ description: null });
  expect(normalizeUpdate({ description: ' ' })).toEqual({ description: ' ' });
});
it('rechaza vacío y valores inválidos', () => {
  expect(() => normalizeUpdate({})).toThrow(/--title/);
  expect(() => normalizeUpdate({ title: ' ' })).toThrow(/título/);
  expect(() => normalizeUpdate({ title: 'bien', priority: 'urgent' })).toThrow(/Prioridad/);
});
