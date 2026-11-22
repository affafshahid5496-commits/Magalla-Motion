// Operating rule 1 (availability / capacity), the one covered by automated tests.
//
// A booking accepts 1 to 4 seats per class, and never more than the seats
// still free. The function is pure: it returns a result object so the same
// answer can be checked in tests and shown in the interface.

export const MIN_SEATS = 1;
export const MAX_SEATS_PER_BOOKING = 4;

/**
 * @param {number} seats      requested number of seats
 * @param {number} remaining  seats still free in the class
 * @param {number} [max]      per-booking maximum (default 4)
 * @returns {{ok: boolean, code: string, message: string}}
 */
export function validateSeatCount(seats, remaining, max = MAX_SEATS_PER_BOOKING) {
  if (!Number.isInteger(seats)) {
    return { ok: false, code: 'NOT_A_WHOLE_NUMBER', message: 'Enter a whole number of seats.' };
  }
  if (seats < MIN_SEATS) {
    return {
      ok: false,
      code: 'BELOW_MINIMUM',
      message: `Book at least ${MIN_SEATS} seat.`,
    };
  }
  if (seats > max) {
    return {
      ok: false,
      code: 'ABOVE_MAXIMUM',
      message: `You can book up to ${max} seats per class. For larger groups, please contact the studio.`,
    };
  }
  if (remaining <= 0) {
    return { ok: false, code: 'CLASS_FULL', message: 'This class is full.' };
  }
  if (seats > remaining) {
    return {
      ok: false,
      code: 'EXCEEDS_REMAINING',
      message: `Only ${remaining} ${remaining === 1 ? 'seat is' : 'seats are'} left in this class.`,
    };
  }
  return { ok: true, code: 'OK', message: '' };
}

/** Turns text typed in a seat field into a number (NaN when empty or invalid). */
export function parseSeats(raw) {
  const text = String(raw ?? '').trim();
  if (text === '') return Number.NaN;
  return Number(text);
}
