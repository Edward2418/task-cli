import { expect, it } from 'vitest';
import { userError, errorMessage } from '../../utils/errors.js';

it('conserva mensajes accionables propios', () => {
  expect(errorMessage(userError('Revise el ID.'))).toBe('Revise el ID.');
});
it.each([
  ['SQLITE_BUSY', /ocupado.*reintentar/i],
  ['SQLITE_NOTADB', /copia válida/i],
  ['SQLITE_CORRUPT', /copia válida/i],
  ['EACCES', /permisos/i],
  ['SQLITE_FULL', /espacio/i],
])('traduce %s sin stack trace', (code, expected) => {
  expect(errorMessage(Object.assign(new Error('dato interno'), { code }))).toMatch(expected);
});
it('no expone detalles internos desconocidos', () => {
  expect(errorMessage(new Error('dato interno'))).not.toContain('dato interno');
});
