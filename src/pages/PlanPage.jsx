import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import PlanSummary from '../components/PlanSummary.jsx';
import SeatControl from '../components/SeatControl.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useApp } from '../state/AppState.jsx';
import { getClassStatus } from '../rules/availability.js';
import { calculateLine } from '../rules/pricing.js';
import { parseSeats, validateSeatCount } from '../rules/seatLimit.js';
import { formatDateTime, formatPKR, pluralize } from '../utils/format.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

function PlanItem({ item, cls, issues, now, onSeats, onRemove }) {
  const [raw, setRaw] = useState(String(item.seats));

  // The committed seat count can change (for example by "Fix"), so keep the field in sync.
  useEffect(() => {
    setRaw(String(item.seats));
  }, [item.seats]);

  if (!cls) {
    return (
      <li className="plan-item plan-item--problem">
        <h2 className="plan-item__title">Class no longer available</h2>
        {issues.map((issue) => (
          <p key={issue.kind} className="field-error">
            {issue.message}
          </p>
        ))}
        <button type="button" className="btn btn--secondary" onClick={() => onRemove(item.classId)}>
          Remove it
        </button>
      </li>
    );
  }

  const status = getClassStatus(cls, now);
  const typed = parseSeats(raw);
  const result = validateSeatCount(typed, cls.remaining);
  const showTypingError = !result.ok && typed !== item.seats;
  const line = calculateLine(cls.pricePKR, item.seats);

  function handleChange(next) {
    setRaw(next);
    const check = validateSeatCount(parseSeats(next), cls.remaining);
    if (check.ok) onSeats(cls.id, parseSeats(next)); // only valid values reach shared state
  }

  return (
    <li className={`plan-item ${issues.length ? 'plan-item--problem' : ''}`}>
      <div className="plan-item__head">
        <h2 className="plan-item__title">
          <Link to={`/classes/${cls.id}`}>{cls.title}</Link>
        </h2>
        <p>
          {formatDateTime(cls.startsAt)} · <StatusBadge status={status} />
        </p>
      </div>

      {issues.length > 0 && (
        <ul className="issue-list" aria-label={`Problems with ${cls.title}`}>
          {issues.map((issue) => (
            <li key={issue.kind}>
              <p className="field-error">
                <strong>Needs attention:</strong> {issue.message}
              </p>
              {issue.fix && (
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() =>
                    issue.fix.type === 'remove' ? onRemove(cls.id) : onSeats(cls.id, issue.fix.seats)
                  }
                >
                  {issue.fix.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="plan-item__controls">
        {status.bookable ? (
          <SeatControl
            label={`Seats for ${cls.title}`}
            value={raw}
            onChange={handleChange}
            result={showTypingError ? result : null}
            remaining={cls.remaining}
          />
        ) : (
          <p className="hint">Seats cannot be changed for a class that is {status.label.toLowerCase()}.</p>
        )}
        <div className="plan-item__money">
          <p>
            {pluralize(item.seats, 'seat')} × {formatPKR(cls.pricePKR)}
          </p>
          <p>
            <strong>{formatPKR(line.total)}</strong>
            {line.discount > 0 && <span className="hint"> after {formatPKR(line.discount)} group discount</span>}
          </p>
          <button type="button" className="btn btn--secondary" onClick={() => onRemove(cls.id)}>
            Remove {cls.title}
          </button>
        </div>
      </div>
    </li>
  );
}

export default function PlanPage() {
  useDocumentTitle('My plan');
  const { plan, classesById, planIssues, summary, now, setSeats, removeFromPlan } = useApp();

  if (plan.length === 0) {
    return (
      <EmptyState
        headingLevel="h1"
        title="Your plan is empty"
        actions={
          <Link className="btn btn--primary" to="/">
            Browse classes
          </Link>
        }
      >
        <p>Add one or more classes and they will appear here with a running total.</p>
      </EmptyState>
    );
  }

  const issuesFor = (classId) => planIssues.filter((issue) => issue.classId === classId);
  const blocked = planIssues.length > 0;

  return (
    <>
      <h1>My plan</h1>
      <p className="lead">Your plan is saved on this device. We re-check it against the latest timetable every time.</p>

      {blocked && (
        <div className="callout callout--error" role="alert">
          <strong>
            {pluralize(planIssues.length, 'thing needs', 'things need')} fixing before you can check out.
          </strong>{' '}
          Use the buttons under each class to correct it.
        </div>
      )}

      <div className="two-col">
        <ul className="plan-list">
          {plan.map((item) => (
            <PlanItem
              key={item.classId}
              item={item}
              cls={classesById.get(item.classId)}
              issues={issuesFor(item.classId)}
              now={now}
              onSeats={setSeats}
              onRemove={removeFromPlan}
            />
          ))}
        </ul>

        <PlanSummary summary={summary}>
          {blocked ? (
            <>
              <button type="button" className="btn btn--primary btn--block" disabled>
                Continue to checkout
              </button>
              <p className="hint">Fix the classes marked “Needs attention” to continue.</p>
            </>
          ) : (
            <Link className="btn btn--primary btn--block" to="/checkout">
              Continue to checkout
            </Link>
          )}
          <Link className="btn btn--secondary btn--block" to="/">
            Add more classes
          </Link>
        </PlanSummary>
      </div>
    </>
  );
}
