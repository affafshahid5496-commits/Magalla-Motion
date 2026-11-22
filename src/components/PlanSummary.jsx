import { formatDuration, formatPKR, pluralize } from '../utils/format.js';
import { GROUP_DISCOUNT_MIN_SEATS } from '../rules/pricing.js';

// Calculated summary: counts, total class time, discount and total.
export default function PlanSummary({ summary, headingLevel = 'h2', children }) {
  const Heading = headingLevel;
  return (
    <section className="panel summary" aria-labelledby="summary-heading">
      <Heading id="summary-heading" className="panel__title">
        Summary
      </Heading>
      <dl className="summary__list">
        <div>
          <dt>Classes</dt>
          <dd>{summary.classCount}</dd>
        </div>
        <div>
          <dt>Seats</dt>
          <dd>{summary.seatCount}</dd>
        </div>
        <div>
          <dt>Total class time</dt>
          <dd>{formatDuration(summary.durationMinutes)}</dd>
        </div>
        <div>
          <dt>Subtotal</dt>
          <dd>{formatPKR(summary.subtotal)}</dd>
        </div>
        <div>
          <dt>Group discount</dt>
          <dd>{summary.discount > 0 ? `− ${formatPKR(summary.discount)}` : formatPKR(0)}</dd>
        </div>
        <div className="summary__total">
          <dt>Total (simulated)</dt>
          <dd>{formatPKR(summary.total)}</dd>
        </div>
      </dl>
      <p className="hint">
        {pluralize(GROUP_DISCOUNT_MIN_SEATS, 'seat')} or more in one class get 10% off that class. No fees.
      </p>
      {children}
    </section>
  );
}
