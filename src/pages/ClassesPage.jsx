import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ClassCard from '../components/ClassCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useApp } from '../state/AppState.jsx';
import { CATEGORIES } from '../data/classes.js';
import { LEVELS } from '../rules/eligibility.js';
import { getClassStatus } from '../rules/availability.js';
import { BOOKING_CUTOFF_MINUTES } from '../rules/cutoff.js';
import { MAX_SEATS_PER_BOOKING } from '../rules/seatLimit.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

const SORTS = {
  soonest: { label: 'Soonest first', compare: (a, b) => a.startsAt - b.startsAt },
  'price-asc': { label: 'Price: low to high', compare: (a, b) => a.pricePKR - b.pricePKR },
  'price-desc': { label: 'Price: high to low', compare: (a, b) => b.pricePKR - a.pricePKR },
  seats: { label: 'Most seats left', compare: (a, b) => b.remaining - a.remaining },
};

export default function ClassesPage() {
  useDocumentTitle('Classes');
  const { classes, plan, planLines, now, prefs, setPrefs, setSeats, removeFromPlan, reload } = useApp();
  const [params, setParams] = useSearchParams();

  // Search, filters and sort live in the URL, so Back, refresh and shared links keep them.
  const query = params.get('q') ?? '';
  const category = params.get('cat') ?? 'all';
  const level = params.get('level') ?? 'all';
  const onlyBookable = params.get('open') === '1';
  const sort = SORTS[params.get('sort')] ? params.get('sort') : SORTS[prefs.sort] ? prefs.sort : 'soonest';

  function updateParam(key, value) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value === '' || value === 'all' || value === false) next.delete(key);
        else next.set(key, value === true ? '1' : value);
        return next;
      },
      { replace: true },
    );
  }

  function changeSort(value) {
    updateParam('sort', value);
    setPrefs((prev) => ({ ...prev, sort: value })); // remembered for next visit
  }

  function clearFilters() {
    setParams(new URLSearchParams(), { replace: true });
  }

  const filtersActive =
    query.trim() !== '' || category !== 'all' || level !== 'all' || onlyBookable;

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return classes
      .filter((cls) => {
        if (category !== 'all' && cls.category !== category) return false;
        if (level !== 'all' && cls.level !== level) return false;
        if (onlyBookable && !getClassStatus(cls, now).bookable) return false;
        if (term) {
          const haystack = [cls.title, cls.instructor ?? '', cls.category, cls.level, cls.description]
            .join(' ')
            .toLowerCase();
          if (!haystack.includes(term)) return false;
        }
        return true;
      })
      .sort(SORTS[sort].compare);
  }, [classes, query, category, level, onlyBookable, sort, now]);

  // Selections stay in the plan even when filters hide them; say so instead of hiding silently.
  const hiddenSelections = planLines.filter((line) => !results.some((cls) => cls.id === line.cls.id));

  const plannedSeatsFor = (id) => plan.find((item) => item.classId === id)?.seats ?? 0;

  const suggestions = useMemo(
    () =>
      classes
        .filter((cls) => getClassStatus(cls, now).bookable)
        .sort(SORTS.soonest.compare)
        .slice(0, 3),
    [classes, now],
  );

  return (
    <>
      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">Islamabad · F-7 Markaz studio</p>
        <h1 id="page-title">Group classes that fit around your lectures</h1>
        <p className="hero__lead">
          Strength, cardio, dance and yoga for university students and young professionals. See price, seats left
          and level before you open anything.
        </p>
        <ul className="rule-chips" aria-label="Booking rules">
          <li>1 to {MAX_SEATS_PER_BOOKING} seats per class</li>
          <li>Bookings close {BOOKING_CUTOFF_MINUTES / 60} hours before start</li>
          <li>10% off when you book 3+ seats</li>
        </ul>
      </section>

      <section aria-labelledby="timetable-heading">
        <h2 id="timetable-heading">Timetable</h2>

        <form className="filters" role="search" onSubmit={(event) => event.preventDefault()}>
          <div className="field field--wide">
            <label htmlFor="search">Search classes, coaches or levels</label>
            <input
              id="search"
              className="input"
              type="search"
              value={query}
              placeholder="Try “yoga” or “Usman”"
              onChange={(event) => updateParam('q', event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="category">Type</label>
            <select
              id="category"
              className="input"
              value={category}
              onChange={(event) => updateParam('cat', event.target.value)}
            >
              <option value="all">All types</option>
              {CATEGORIES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="level">Level</label>
            <select
              id="level"
              className="input"
              value={level}
              onChange={(event) => updateParam('level', event.target.value)}
            >
              <option value="all">All levels</option>
              {LEVELS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="sort">Sort by</label>
            <select
              id="sort"
              className="input"
              value={sort}
              onChange={(event) => changeSort(event.target.value)}
            >
              {Object.entries(SORTS).map(([key, option]) => (
                <option key={key} value={key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <label className="check field--wide">
            <input
              type="checkbox"
              checked={onlyBookable}
              onChange={(event) => updateParam('open', event.target.checked)}
            />
            <span>Only show classes I can book now</span>
          </label>
        </form>

        <p className="results-count" role="status">
          {classes.length === 0
            ? 'No classes loaded.'
            : `Showing ${results.length} of ${classes.length} classes`}
          {filtersActive && (
            <>
              {' '}
              <button type="button" className="link-button" onClick={clearFilters}>
                Clear filters
              </button>
            </>
          )}
        </p>

        {hiddenSelections.length > 0 && (
          <div className="notice" role="status">
            <p>
              <strong>
                {hiddenSelections.length} of your selected {hiddenSelections.length === 1 ? 'class is' : 'classes are'}{' '}
                hidden by these filters
              </strong>{' '}
              but still in your plan: {hiddenSelections.map((line) => line.cls.title).join(', ')}.
            </p>
            <p>
              <button type="button" className="link-button" onClick={clearFilters}>
                Clear filters to see them
              </button>{' '}
              or <Link to="/plan">review your plan</Link>.
            </p>
          </div>
        )}

        {classes.length === 0 ? (
          <EmptyState
            title="No classes are scheduled right now"
            actions={
              <button type="button" className="btn btn--primary" onClick={reload}>
                Check again
              </button>
            }
          >
            <p>The studio has not published a timetable yet. New classes are added every Sunday.</p>
          </EmptyState>
        ) : results.length === 0 ? (
          <EmptyState
            title="No classes match your search"
            actions={
              <button type="button" className="btn btn--primary" onClick={clearFilters}>
                Clear all filters
              </button>
            }
          >
            <p>
              Try a shorter search word, a different type or level, or switch off “only show classes I can book
              now”.
            </p>
            {suggestions.length > 0 && (
              <>
                <p>
                  <strong>Next classes with seats:</strong>
                </p>
                <ul className="plain-list">
                  {suggestions.map((cls) => (
                    <li key={cls.id}>
                      <Link to={`/classes/${cls.id}`}>{cls.title}</Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </EmptyState>
        ) : (
          <ul className="card-grid">
            {results.map((cls) => (
              <li key={cls.id}>
                <ClassCard
                  cls={cls}
                  now={now}
                  plannedSeats={plannedSeatsFor(cls.id)}
                  onAdd={(id) => setSeats(id, 1)}
                  onRemove={removeFromPlan}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
