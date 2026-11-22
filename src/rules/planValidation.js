import { validateSeatCount, MAX_SEATS_PER_BOOKING } from './seatLimit.js';
import { checkBookingCutoff } from './cutoff.js';
import { checkEligibility } from './eligibility.js';

/** Cleans whatever came out of local storage so bad data cannot crash the app. */
export function sanitizePlan(raw) {
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  const clean = [];
  for (const item of raw) {
    if (
      item &&
      typeof item.classId === 'string' &&
      Number.isInteger(item.seats) &&
      !seen.has(item.classId)
    ) {
      seen.add(item.classId);
      clean.push({ classId: item.classId, seats: item.seats });
    }
  }
  return clean;
}

/**
 * Checks every selection against the CURRENT data and rules.
 * Used for restored (saved) selections, after availability changes, and at checkout.
 * Each issue says what is wrong and offers one fix the person can accept.
 */
export function validatePlan(plan, classesById, { now = new Date(), participantLevel = null } = {}) {
  const issues = [];

  for (const item of plan) {
    const cls = classesById.get(item.classId);

    if (!cls) {
      issues.push({
        classId: item.classId,
        kind: 'missing',
        message: 'This class is no longer on the timetable.',
        fix: { type: 'remove', label: 'Remove it' },
      });
      continue;
    }

    const cutoff = checkBookingCutoff(cls.startsAt, now);
    if (!cutoff.ok) {
      issues.push({
        classId: cls.id,
        kind: 'closed',
        message: `${cutoff.message} Pick another time.`,
        fix: { type: 'remove', label: 'Remove class' },
      });
    } else if (cls.remaining <= 0) {
      issues.push({
        classId: cls.id,
        kind: 'full',
        message: 'This class is now full.',
        fix: { type: 'remove', label: 'Remove class' },
      });
    } else {
      const seats = validateSeatCount(item.seats, cls.remaining);
      if (!seats.ok) {
        const target = Math.max(1, Math.min(MAX_SEATS_PER_BOOKING, cls.remaining));
        issues.push({
          classId: cls.id,
          kind: 'seats',
          message: seats.message,
          fix: { type: 'set-seats', seats: target, label: `Change to ${target} ${target === 1 ? 'seat' : 'seats'}` },
        });
      }
    }

    if (participantLevel) {
      const level = checkEligibility(participantLevel, cls.level);
      if (!level.ok) {
        issues.push({
          classId: cls.id,
          kind: 'ineligible',
          message: level.message,
          fix: { type: 'remove', label: 'Remove class' },
        });
      }
    }
  }

  return issues;
}
