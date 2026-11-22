import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateSeatCount, MAX_SEATS_PER_BOOKING } from '../src/rules/seatLimit.js';

// Rule under test: a booking accepts 1 to 4 seats, never more than the seats left.

test('accepts an ordinary valid seat count', () => {
  const result = validateSeatCount(2, 10);
  assert.equal(result.ok, true);
  assert.equal(result.code, 'OK');
});

test('accepts exactly the limit (4 seats)', () => {
  assert.equal(MAX_SEATS_PER_BOOKING, 4);
  const result = validateSeatCount(4, 10);
  assert.equal(result.ok, true);
});

test('rejects one seat above the limit (5 seats)', () => {
  const result = validateSeatCount(5, 10);
  assert.equal(result.ok, false);
  assert.equal(result.code, 'ABOVE_MAXIMUM');
  assert.match(result.message, /up to 4 seats/);
});

test('rejects zero and non-whole numbers', () => {
  assert.equal(validateSeatCount(0, 10).code, 'BELOW_MINIMUM');
  assert.equal(validateSeatCount(2.5, 10).code, 'NOT_A_WHOLE_NUMBER');
  assert.equal(validateSeatCount(Number.NaN, 10).code, 'NOT_A_WHOLE_NUMBER');
});

test('rejects more seats than remain, and full classes', () => {
  const tooMany = validateSeatCount(3, 2);
  assert.equal(tooMany.ok, false);
  assert.equal(tooMany.code, 'EXCEEDS_REMAINING');
  assert.equal(validateSeatCount(1, 0).code, 'CLASS_FULL');
});

test('accepts exactly the seats remaining', () => {
  assert.equal(validateSeatCount(2, 2).ok, true);
});
