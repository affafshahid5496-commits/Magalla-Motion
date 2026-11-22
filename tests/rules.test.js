import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkBookingCutoff } from '../src/rules/cutoff.js';
import { checkEligibility } from '../src/rules/eligibility.js';
import { calculateLine, summarizePlan } from '../src/rules/pricing.js';
import { validatePlan, sanitizePlan } from '../src/rules/planValidation.js';
import { validateBookingForm } from '../src/rules/formValidation.js';

const now = new Date('2026-12-01T10:00:00');
const minutesFromNow = (m) => new Date(now.getTime() + m * 60000);

test('cutoff: exactly 120 minutes before start is allowed, 119 is not', () => {
  assert.equal(checkBookingCutoff(minutesFromNow(120), now).ok, true);
  assert.equal(checkBookingCutoff(minutesFromNow(119), now).ok, false);
  assert.equal(checkBookingCutoff(minutesFromNow(600), now).ok, true);
});

test('eligibility: level must meet the class level', () => {
  assert.equal(checkEligibility('Beginner', 'Beginner').ok, true);
  assert.equal(checkEligibility('Advanced', 'Intermediate').ok, true);
  assert.equal(checkEligibility('Beginner', 'Advanced').code, 'LEVEL_TOO_LOW');
  assert.equal(checkEligibility('', 'Beginner').code, 'LEVEL_MISSING');
});

test('pricing: 10% group discount applies from 3 seats', () => {
  assert.deepEqual(calculateLine(1000, 2), { subtotal: 2000, discount: 0, total: 2000 });
  assert.deepEqual(calculateLine(1000, 3), { subtotal: 3000, discount: 300, total: 2700 });
});

test('summary adds up lines', () => {
  const lines = [
    { cls: { pricePKR: 1000, durationMin: 60 }, seats: 3 },
    { cls: { pricePKR: 500, durationMin: 30 }, seats: 1 },
  ];
  const s = summarizePlan(lines);
  assert.equal(s.classCount, 2);
  assert.equal(s.seatCount, 4);
  assert.equal(s.durationMinutes, 90);
  assert.equal(s.total, 2700 + 500);
});

test('restored plan is checked against current data', () => {
  const classes = new Map([
    ['a', { id: 'a', level: 'Beginner', remaining: 2, startsAt: minutesFromNow(600) }],
    ['b', { id: 'b', level: 'Beginner', remaining: 0, startsAt: minutesFromNow(600) }],
    ['c', { id: 'c', level: 'Advanced', remaining: 5, startsAt: minutesFromNow(30) }],
  ]);
  const plan = [
    { classId: 'a', seats: 4 },
    { classId: 'b', seats: 1 },
    { classId: 'c', seats: 1 },
    { classId: 'gone', seats: 1 },
  ];
  const issues = validatePlan(plan, classes, { now });
  assert.deepEqual(
    issues.map((i) => [i.classId, i.kind]),
    [['a', 'seats'], ['b', 'full'], ['c', 'closed'], ['gone', 'missing']],
  );
  assert.equal(issues[0].fix.seats, 2);
});

test('sanitizePlan drops malformed saved data', () => {
  assert.deepEqual(sanitizePlan('nope'), []);
  assert.deepEqual(
    sanitizePlan([{ classId: 'a', seats: 2 }, { classId: 'a', seats: 3 }, { classId: 5, seats: 1 }, null]),
    [{ classId: 'a', seats: 2 }],
  );
});

test('form validation gives specific messages', () => {
  const empty = validateBookingForm({ fullName: '', email: '', phone: '', level: '', agree: false });
  assert.equal(Object.keys(empty).length, 5);
  const ok = validateBookingForm({
    fullName: "Ayesha O'Neil",
    email: 'ayesha@example.com',
    phone: '0300 1234567',
    level: 'Beginner',
    agree: true,
  });
  assert.deepEqual(ok, {});
  const badPhone = validateBookingForm({
    fullName: 'Ali Khan',
    email: 'ali@example.com',
    phone: '12345',
    level: 'Beginner',
    agree: true,
  });
  assert.deepEqual(Object.keys(badPhone), ['phone']);
});
