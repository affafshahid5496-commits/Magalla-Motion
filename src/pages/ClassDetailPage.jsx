import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import ClassArt from '../components/ClassArt.jsx';
import EmptyState from '../components/EmptyState.jsx';
import SeatControl from '../components/SeatControl.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useApp } from '../state/AppState.jsx';
import { getClassStatus } from '../rules/availability.js';
import { BOOKING_CUTOFF_MINUTES } from '../rules/cutoff.js';
import { checkEligibility } from '../rules/eligibility.js';
import { calculateLine, GROUP_DISCOUNT_MIN_SEATS } from '../rules/pricing.js';
import { MAX_SEATS_PER_BOOKING, parseSeats, validateSeatCount } from '../rules/seatLimit.js';
import { formatDateTime, formatDuration, formatPKR, formatTime, levelRequirement, pluralize } from '../utils/format.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function ClassDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { classesById, plan, now, prefs, setSeats, removeFromPlan } = useApp();

  const cls = classesById.get(id);
  const planned = plan.find((item) => item.classId === id);
  const [raw, setRaw] = useState(String(planned?.seats ?? 1));
  const [notice, setNotice] = useState('');

  // Keep the field in step if the plan changes elsewhere (for example on the plan page).
  useEffect(() => {
    if (planned) setRaw(String(planned.seats));
  }, [planned?.seats]); // eslint-disable-line react-hooks/exhaustive-deps

  useDocumentTitle(cls ? cls.title : 'Class not found');

  const backTo = location.state?.from ?? '/';

  if (!cls) {
    return (
      <EmptyState
        headingLevel="h1"
        title="We could not find that class"
        actions={
          <Link className="btn btn--primary" to="/">
            Browse all classes
          </Link>
        }
      >
        <p>
          There is no class with the code “{id}”. It may have been removed, or the link may have a typo.
        </p>
      </EmptyState>
    );
  }

  const status = getClassStatus(cls, now);
  const seats = parseSeats(raw);
  const result = validateSeatCount(seats, cls.remaining);
  const eligibility = prefs.level ? checkEligibility(prefs.level, cls.level) : { ok: true };
  const closesAt = new Date(cls.startsAt.getTime() - BOOKING_CUTOFF_MINUTES * 60000);
  const canSubmit = status.bookable && result.ok;
  const line = result.ok ? calculateLine(cls.pricePKR, seats) : null;

  function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    setSeats(cls.id, seats);
    setNotice(planned ? 'Your plan was updated.' : 'Added to your plan.');
  }

  return (
    <>
      <p>
        <Link to={backTo} className="back-link">
          ← Back to classes
        </Link>
      </p>

      <article className="detail" aria-labelledby="class-title">
        <div className="detail__info">
          <ClassArt category={cls.category} title={cls.title} size="hero" />
          <p className="eyebrow">
            {cls.category} · {levelRequirement(cls.level)}
          </p>
          <h1 id="class-title" className="detail__title">
            {cls.title}
          </h1>

          {/* Key facts first: everything needed to decide appears before the long description. */}
          <h2 className="visually-hidden">Key facts</h2>
          <dl className="facts facts--large">
            <div>
              <dt>When</dt>
              <dd>{formatDateTime(cls.startsAt)}</dd>
            </div>
            <div>
              <dt>Length</dt>
              <dd>{formatDuration(cls.durationMin)}</dd>
            </div>
            <div>
              <dt>Price</dt>
              <dd>{formatPKR(cls.pricePKR)} per seat</dd>
            </div>
            <div>
              <dt>Seats</dt>
              <dd>
                <StatusBadge status={status} />
              </dd>
            </div>
            <div>
              <dt>Level</dt>
              <dd>{levelRequirement(cls.level)}</dd>
            </div>
            <div>
              <dt>Coach</dt>
              <dd>{cls.instructor ?? 'To be announced'}</dd>
            </div>
          </dl>

          <h2>Booking conditions</h2>
          <ul className="conditions">
            <li>
              {pluralize(MAX_SEATS_PER_BOOKING, 'seat')} is the most you can book per class.
            </li>
            <li>
              Booking closes {BOOKING_CUTOFF_MINUTES / 60} hours before the class (for this class: {formatDateTime(closesAt)}
              ).
            </li>
            <li>
              Book {GROUP_DISCOUNT_MIN_SEATS} or more seats and get 10% off.
            </li>
            <li>
              {cls.level === 'Beginner'
                ? 'No experience needed.'
                : `You need ${cls.level} experience or above. You will confirm your level at checkout.`}
            </li>
          </ul>

          <h2>About this class</h2>
          <p className="long-text">{cls.description}</p>

          <h2>What to bring</h2>
          <ul>
            {cls.bring.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <aside className="booking-panel panel" aria-labelledby="booking-heading">
          <h2 id="booking-heading" className="panel__title">
            Book this class
          </h2>
          <p className="booking-panel__price">
            {formatPKR(cls.pricePKR)} <span>per seat · starts {formatTime(cls.startsAt)}</span>
          </p>

          {!status.bookable ? (
            <p className="callout callout--error" role="status">
              <strong>{status.label}.</strong> {status.detail} <Link to="/">See other classes</Link>.
            </p>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <SeatControl value={raw} onChange={setRaw} result={result} remaining={cls.remaining} />

              {line && (
                <p className="booking-panel__line" aria-live="polite">
                  {pluralize(seats, 'seat')}: <strong>{formatPKR(line.total)}</strong>
                  {line.discount > 0 && <span> (includes {formatPKR(line.discount)} group discount)</span>}
                </p>
              )}

              {!eligibility.ok && (
                <p className="callout callout--warn" role="status">
                  {eligibility.message} You can still add it, but checkout will ask you to fix this.
                </p>
              )}

              <button type="submit" className="btn btn--primary btn--block" disabled={!canSubmit}>
                {planned ? 'Update plan' : 'Add to plan'}
              </button>
            </form>
          )}

          {notice && (
            <p className="callout callout--ok" role="status">
              {notice} <Link to="/plan">Review plan</Link>
            </p>
          )}
          {planned && (
            <button
              type="button"
              className="btn btn--secondary btn--block"
              onClick={() => {
                removeFromPlan(cls.id);
                setNotice('Removed from your plan.');
                setRaw('1');
              }}
            >
              Remove from plan
            </button>
          )}
        </aside>
      </article>
    </>
  );
}
