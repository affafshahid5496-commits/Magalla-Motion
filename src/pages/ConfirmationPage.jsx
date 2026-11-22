import { Link, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import PlanSummary from '../components/PlanSummary.jsx';
import { useApp } from '../state/AppState.jsx';
import { formatDateTime, formatPKR, pluralize } from '../utils/format.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function ConfirmationPage() {
  const { ref } = useParams();
  const { lastOrder } = useApp();
  const found = lastOrder && lastOrder.ref === ref;
  useDocumentTitle(found ? 'Booking confirmed' : 'Booking not found');

  if (!found) {
    return (
      <EmptyState
        headingLevel="h1"
        title="We could not find that booking"
        actions={
          <Link className="btn btn--primary" to="/">
            Browse classes
          </Link>
        }
      >
        <p>
          Only the most recent simulated booking on this device is kept. The reference “{ref}” does not match it.
        </p>
      </EmptyState>
    );
  }

  return (
    <>
      <div className="callout callout--ok confirmation" role="status">
        <h1>Booking confirmed (simulated)</h1>
        <p>
          Your reference is <strong className="ref">{lastOrder.ref}</strong>. This is a demonstration: no payment was
          taken and no message was sent.
        </p>
      </div>

      <div className="two-col">
        <section className="panel" aria-labelledby="booked-heading">
          <h2 id="booked-heading" className="panel__title">
            What you booked
          </h2>
          <ul className="plain-list">
            {lastOrder.items.map((item) => (
              <li key={item.classId} className="confirmation__item">
                <strong>{item.title}</strong>
                <br />
                {formatDateTime(item.startsAt)} · {pluralize(item.seats, 'seat')} · {formatPKR(item.total)}
                {item.discount > 0 && <span className="hint"> (includes {formatPKR(item.discount)} discount)</span>}
              </li>
            ))}
          </ul>
          <p className="hint">Arrive 10 minutes early. Cancellation is not part of this demo.</p>
        </section>

        <PlanSummary summary={lastOrder.summary}>
          <Link className="btn btn--primary btn--block" to="/">
            Book more classes
          </Link>
        </PlanSummary>
      </div>
    </>
  );
}
