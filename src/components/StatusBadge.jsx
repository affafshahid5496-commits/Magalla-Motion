// Availability badge. The text label carries the meaning; colour only supports it.
export default function StatusBadge({ status }) {
  return <span className={`badge badge--${status.state}`}>{status.label}</span>;
}
