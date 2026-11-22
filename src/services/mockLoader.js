import { classCatalog } from '../data/classes.js';
import { getRemainingSeats } from '../rules/availability.js';
import { KEYS, readJSON, writeJSON } from './storage.js';

// ---- Demonstration controls (documented in the README) ---------------------
// failLoad          -> the next timetable load fails until "Retry" is pressed
// emptyTimetable    -> the loader returns no classes at all
// remainingOverrides-> forces seats-left for given class ids (simulates availability changes)
export const DEFAULT_DEMO = { failLoad: false, emptyTimetable: false, remainingOverrides: {} };

export function getDemoSettings() {
  const saved = readJSON(KEYS.demo, {});
  return { ...DEFAULT_DEMO, ...saved, remainingOverrides: { ...(saved.remainingOverrides ?? {}) } };
}

export function saveDemoSettings(settings) {
  writeJSON(KEYS.demo, settings);
}

// ---- Building the timetable -------------------------------------------------
function dateFor(dayOffset, hour, minute, base) {
  const date = new Date(base);
  date.setHours(hour, minute, 0, 0);
  date.setDate(date.getDate() + dayOffset);
  return date;
}

export function buildClasses(now = new Date()) {
  const booked = readJSON(KEYS.booked, {});
  const demo = getDemoSettings();

  return classCatalog.map((record) => {
    const forced = demo.remainingOverrides[record.id];
    const remaining =
      typeof forced === 'number' ? forced : getRemainingSeats(record, booked[record.id] ?? 0);
    return {
      ...record,
      startsAt: dateFor(record.dayOffset, record.hour, record.minute, now),
      remaining,
    };
  });
}

/** Asynchronous mock loader: resolves with classes, or rejects when failure is simulated. */
export function loadClasses() {
  return new Promise((resolve, reject) => {
    const demo = getDemoSettings();
    setTimeout(() => {
      if (demo.failLoad) {
        reject(new Error('We could not load the timetable. (Simulated failure)'));
      } else if (demo.emptyTimetable) {
        resolve([]);
      } else {
        resolve(buildClasses());
      }
    }, 600);
  });
}

/** Simulated "submit". Nothing leaves the browser. */
export function submitBooking() {
  return new Promise((resolve) => setTimeout(resolve, 700));
}
