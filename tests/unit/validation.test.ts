import { describe, expect, it } from 'vitest';
import { parseId, parseTitle, parseStatus, parsePriority } from '../../utils/validation.js';

describe('validación compartida', () => {
  it.each(['0', '-1', '+1', '1.5', '1e2', '3abc', '', ' 1', '9007199254740992'])('rechaza ID %s', value => {
    expect(() => parseId(value)).toThrow(/entero decimal positivo/);
  });
  it('admite ceros iniciales y máximo seguro', () => {
    expect(parseId('001')).toBe(1);
    expect(parseId('9007199254740991')).toBe(Number.MAX_SAFE_INTEGER);
  });
  it('normaliza extremos Unicode sin perder espacios interiores', () => {
    expect(parseTitle('\u2003  Acción  próxima \u00a0')).toBe('Acción  próxima');
    expect(() => parseTitle('\u2003 ')).toThrow(/título/);
  });
  it.each(['todo', 'in-progress', 'done'])('acepta estado %s', value => expect(parseStatus(value)).toBe(value));
  it.each(['high', 'medium', 'low'])('acepta prioridad %s', value => expect(parsePriority(value)).toBe(value));
  it('rechaza enumeraciones sin normalizarlas', () => {
    expect(() => parseStatus('TODO')).toThrow(/todo, in-progress, done/);
    expect(() => parsePriority('urgent')).toThrow(/high, medium, low/);
    expect(() => parsePriority('urgent')).toThrow(/urgent/);
    expect(() => parseStatus('UNKNOWN')).toThrow(/UNKNOWN/);
  });
});
