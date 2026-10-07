import { test } from 'node:test';
import assert from 'node:assert/strict';
import { petFrame, petDirection, petPosition } from '../shared/motion.js';
test('all directions use the v2 clockwise atlas order', () => {
  for (let i = 0; i < 16; i++) {
    const a = i * Math.PI / 8;
    assert.deepEqual(petDirection(Math.sin(a) * 100, -Math.cos(a) * 100), { row: 9 + Math.floor(i / 8), column: i % 8 });
  }
  assert.equal(petDirection(0, 0), null);
});
test('elapsed time wraps valid frames, reduced motion stays still', () => {
  assert.deepEqual(petFrame('waving', 640), { row: 3, column: 0 });
  assert.deepEqual(petFrame('waving', 639), { row: 3, column: 3 });
  assert.deepEqual(petFrame('jumping', 400, true), { row: 4, column: 0 });
  assert.deepEqual(petFrame('unknown', 0), { row: 0, column: 0 });
});
test('dragging stays in bounds even in a smaller viewport', () => {
  assert.deepEqual(petPosition(-50, 500, 300, 400, 192, 208, 80), { x: 0, y: 192 });
  assert.deepEqual(petPosition(50, 60, 100, 100, 192, 208, 80), { x: 0, y: 0 });
});
