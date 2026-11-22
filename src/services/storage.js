// Small wrapper around localStorage. It never throws: private windows, blocked
// storage or corrupted JSON all fall back to the default value.

const PREFIX = 'mm.';

export const KEYS = {
  plan: 'plan.v1', // selected classes + seats
  prefs: 'prefs.v1', // sort order and experience level
  booked: 'booked.v1', // seats this browser has "booked" (simulated)
  demo: 'demo.v1', // demonstration controls
  lastOrder: 'lastOrder.v1', // last confirmation (no personal details)
};

export function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key) {
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}
