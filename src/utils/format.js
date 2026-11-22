export const formatPKR = (amount) => `Rs ${Number(amount).toLocaleString('en-PK')}`;

const dateTimeFormat = new Intl.DateTimeFormat('en-PK', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
});
const timeFormat = new Intl.DateTimeFormat('en-PK', { hour: 'numeric', minute: '2-digit' });

export const formatDateTime = (date) => dateTimeFormat.format(new Date(date));
export const formatTime = (date) => timeFormat.format(new Date(date));

export function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

// What a class level means for a visitor.
export function levelRequirement(level) {
  if (level === 'Beginner') return 'Open to all levels';
  if (level === 'Intermediate') return 'Intermediate or above';
  return 'Advanced only';
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}
