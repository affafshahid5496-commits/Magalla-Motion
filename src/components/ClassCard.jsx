import { Link, useLocation } from 'react-router-dom';
import ClassArt from './ClassArt.jsx';
import StatusBadge from './StatusBadge.jsx';
import { getClassStatus } from '../rules/availability.js';
import { formatDateTime, formatDuration, formatPKR, levelRequirement, pluralize } from '../utils/format.js';

export default function ClassCard({ cls, plannedSeats, now, onAdd, onRemove }) {
  const location = useLocation();
  const status = getClassStatus(cls, now);
  const inPlan = plannedSeats > 0;
  const headingId = `class-${cls.id}`;

  return (
    <article
      className={`card ${inPlan ? 'card--selected' : ''} ${status.bookable ? '' : 'card--unavailable'}`}
      aria-labelledby={headingId}
    >
      <ClassArt category={cls.category} title={cls.title} />
      <div className="card__body">
        <p className="eyebrow">
          {cls.category} · {levelRequirement(cls.level)}
        </p>
        <h3 id={headingId} className="card__title">
          <Link
            to={`/classes/${cls.id}`}
            state={{ from: `${location.pathname}${location.search}` }}
            className="card__link"
          >
            {cls.title}
          </Link>
        </h3>

        {/* The facts people compare on: time, price, seats left and who teaches. */}
        <dl className="facts">
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
            <dt>Coach</dt>
            <dd>{cls.instructor ?? 'To be announced'}</dd>
          </div>
        </dl>

        <p className="card__status">
          <StatusBadge status={status} />
          {inPlan && <span className="tag tag--selected">In your plan: {pluralize(plannedSeats, 'seat')}</span>}
        </p>
        {!status.bookable && <p className="hint">{status.detail}</p>}

        <div className="card__actions">
          {inPlan ? (
            <button type="button" className="btn btn--secondary" onClick={() => onRemove(cls.id)}>
              Remove from plan
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => onAdd(cls.id)}
              disabled={!status.bookable}
            >
              Add 1 seat to plan
            </button>
          )}
          <Link
            className="btn btn--secondary"
            to={`/classes/${cls.id}`}
            state={{ from: `${location.pathname}${location.search}` }}
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
