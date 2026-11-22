import { useId } from 'react';
import { MAX_SEATS_PER_BOOKING, MIN_SEATS, parseSeats } from '../rules/seatLimit.js';

// Controlled seat field. The limit is printed next to the control (rule 1) and the
// validation result for the current text is passed in by the parent.
export default function SeatControl({ label = 'Seats', value, onChange, result, remaining }) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const current = parseSeats(value);
  const upper = Math.min(MAX_SEATS_PER_BOOKING, remaining);
  const hasError = Boolean(result && !result.ok);

  function step(delta) {
    const base = Number.isInteger(current) ? current : 0;
    onChange(String(Math.max(0, base + delta)));
  }

  return (
    <div className="seat-control">
      <label htmlFor={id} className="seat-control__label">
        {label}
      </label>
      <div className="seat-control__row">
        <button
          type="button"
          className="btn btn--secondary btn--icon"
          onClick={() => step(-1)}
          disabled={!(current > MIN_SEATS)}
          aria-label="Decrease seats"
        >
          −
        </button>
        <input
          id={id}
          className={`input seat-control__input ${hasError ? 'input--error' : ''}`}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={`${hintId}${hasError ? ` ${errorId}` : ''}`}
          aria-invalid={hasError}
        />
        <button
          type="button"
          className="btn btn--secondary btn--icon"
          onClick={() => step(1)}
          disabled={Number.isInteger(current) && current >= upper}
          aria-label="Increase seats"
        >
          +
        </button>
      </div>
      <p id={hintId} className="hint">
        {MIN_SEATS} to {MAX_SEATS_PER_BOOKING} seats per booking · {remaining} left in this class
      </p>
      {hasError && (
        <p id={errorId} className="field-error" role="status">
          {result.message}
        </p>
      )}
    </div>
  );
}
