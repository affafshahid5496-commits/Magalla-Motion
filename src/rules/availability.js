import { checkBookingCutoff } from './cutoff.js';

export const LOW_SEATS_THRESHOLD = 3;

export function getRemainingSeats(cls, bookedByVisitor = 0) {
  return Math.max(0, cls.capacity - cls.baseBooked - bookedByVisitor);
}

/**
 * One place that decides whether a class can be booked and how to describe it.
 * Every state has a text label, so colour is never the only signal.
 */
export function getClassStatus(cls, now = new Date()) {
  const cutoff = checkBookingCutoff(cls.startsAt, now);
  if (!cutoff.ok) {
    return { state: 'closed', bookable: false, label: 'Booking closed', detail: cutoff.message };
  }
  if (cls.remaining <= 0) {
    return { state: 'full', bookable: false, label: 'Full', detail: 'No seats left in this class.' };
  }
  if (cls.remaining <= LOW_SEATS_THRESHOLD) {
    return {
      state: 'low',
      bookable: true,
      label: `Only ${cls.remaining} ${cls.remaining === 1 ? 'seat' : 'seats'} left`,
      detail: '',
    };
  }
  return { state: 'open', bookable: true, label: `${cls.remaining} seats left`, detail: '' };
}
