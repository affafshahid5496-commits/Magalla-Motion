// Operating rule 3 (fulfilment): bookings close 120 minutes before a class starts.
// Boundary: exactly 120 minutes before start is still allowed; 119 is not.

export const BOOKING_CUTOFF_MINUTES = 120;

export function minutesUntil(startsAt, now = new Date()) {
  return Math.floor((new Date(startsAt).getTime() - new Date(now).getTime()) / 60000);
}

export function checkBookingCutoff(startsAt, now = new Date(), cutoff = BOOKING_CUTOFF_MINUTES) {
  const minutesLeft = minutesUntil(startsAt, now);
  if (minutesLeft >= cutoff) {
    return { ok: true, code: 'OK', minutesLeft, message: '' };
  }
  return {
    ok: false,
    code: 'CUTOFF_PASSED',
    minutesLeft,
    message: `Booking closed ${cutoff / 60} hours before the class starts.`,
  };
}
