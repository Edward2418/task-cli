import { expect, it } from 'vitest';
import { assertTransition } from '../../utils/transitions.js';
import type { TaskStatus } from '../../types.js';
const states: TaskStatus[] = ['todo', 'in-progress', 'done'];
const valid = ['todo:in-progress', 'in-progress:todo', 'in-progress:done', 'done:todo'];
for (const from of states) for (const to of states) {
  it(`${from} → ${to}`, () => {
    if (valid.includes(`${from}:${to}`)) expect(() => assertTransition(from, to)).not.toThrow();
    else expect(() => assertTransition(from, to)).toThrow(/permitidos/);
  });
}
