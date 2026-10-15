import { expect, it } from 'vitest';
import { normalizeCreate } from '../../utils/validation.js';
it('normaliza creación y conserva descripción no vacía', () => {
  expect(normalizeCreate({ title: ' x ', description: ' ' })).toEqual({ title: 'x', description: ' ', priority: 'medium' });
  expect(normalizeCreate({ title: 'x', description: '' }).description).toBeNull();
});
it('rechaza creación inválida antes de persistir', () => {
  expect(() => normalizeCreate({ title: ' ' })).toThrow();
  expect(() => normalizeCreate({ title: 'x', priority: 'HIGH' })).toThrow();
});
