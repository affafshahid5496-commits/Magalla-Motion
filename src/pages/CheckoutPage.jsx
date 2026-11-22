import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import PlanSummary from '../components/PlanSummary.jsx';
import { useApp } from '../state/AppState.jsx';
import { LEVELS } from '../rules/eligibility.js';
import { validateBookingForm } from '../rules/formValidation.js';
import { submitBooking } from '../services/mockLoader.js';
import { pluralize } from '../utils/format.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

const EMPTY_FORM = { fullName: '', email: '', phone: '', level: '', agree: false };

function Field({ id, label, error, hint, children }) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ');
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children({ describedBy: describedBy || undefined, invalid: Boolean(error) })}
      {hint && (
        <p id={`${id}-hint`} className="hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  useDocumentTitle('Checkout');
  const navigate = useNavigate();
  const { plan, planLines, planIssues, summary, prefs, setPrefs, draft, setDraft, completeBooking, classesById } =
    useApp();

  // The draft lives in shared (in-memory) state, so fixing the plan and coming back keeps what you typed.
  const form = draft ?? { ...EMPTY_FORM, level: prefs.level };
  const [touched, setTouched] = useState({});
  const [attempts, setAttempts] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const summaryRef = useRef(null);

  const allErrors = validateBookingForm(form);
  // Show an error once the field was visited, or after a submit attempt.
  const errors = Object.fromEntries(
    Object.entries(allErrors).filter(([field]) => attempts > 0 || touched[field]),
  );
  const hasProblems = Object.keys(allErrors).length > 0 || planIssues.length > 0;

  useEffect(() => {
    if (attempts > 0 && hasProblems) summaryRef.current?.focus();
  }, [attempts]); // eslint-disable-line react-hooks/exhaustive-deps

  function setField(name, value) {
    setDraft((prev) => ({ ...(prev ?? { ...EMPTY_FORM, level: prefs.level }), [name]: value }));
    if (name === 'level') setPrefs((prev) => ({ ...prev, level: value })); // level is a saved preference
  }

  const markTouched = (name) => setTouched((prev) => ({ ...prev, [name]: true }));

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError('');
    setAttempts((count) => count + 1);
    if (hasProblems || plan.length === 0) return;

    setSubmitting(true);
    try {
      await submitBooking(); // simulated: nothing is sent anywhere
      const order = completeBooking();
      navigate(`/confirmation/${order.ref}`);
    } catch {
      setSubmitError('The simulated booking did not go through. Your details are still here, so please try again.');
      setSubmitting(false);
    }
  }

  if (plan.length === 0) {
    return (
      <EmptyState
        headingLevel="h1"
        title="There is nothing to check out"
        actions={
          <Link className="btn btn--primary" to="/">
            Browse classes
          </Link>
        }
      >
        <p>Add a class to your plan first.</p>
      </EmptyState>
    );
  }

  const problemMessages = [
    ...Object.entries(allErrors).map(([field, message]) => ({ key: field, field, message })),
    ...planIssues.map((issue) => ({
      key: `${issue.classId}-${issue.kind}`,
      message: `${classesById.get(issue.classId)?.title ?? 'A class'}: ${issue.message}`,
    })),
  ];

  return (
    <>
      <p>
        <Link to="/plan" className="back-link">
          ← Back to plan
        </Link>
      </p>
      <h1>Checkout</h1>
      <p className="callout callout--info">
        <strong>Simulated booking.</strong> No payment is taken, and your details stay in this browser tab and are never
        sent or saved.
      </p>

      <div className="two-col">
        <form onSubmit={handleSubmit} noValidate aria-label="Booking details" className="panel form">
          <h2 className="panel__title">Your details</h2>

          {attempts > 0 && hasProblems && (
            <div ref={summaryRef} tabIndex={-1} role="alert" className="callout callout--error">
              <p>
                <strong>Please fix {pluralize(problemMessages.length, 'problem')} to book:</strong>
              </p>
              <ul>
                {problemMessages.map((problem) => (
                  <li key={problem.key}>{problem.message}</li>
                ))}
              </ul>
              {planIssues.length > 0 && (
                <p>
                  <Link to="/plan">Go to your plan to fix class problems</Link>
                </p>
              )}
            </div>
          )}

          <Field id="fullName" label="Full name" error={errors.fullName}>
            {({ describedBy, invalid }) => (
              <input
                id="fullName"
                className={`input ${invalid ? 'input--error' : ''}`}
                type="text"
                autoComplete="name"
                value={form.fullName}
                onChange={(event) => setField('fullName', event.target.value)}
                onBlur={() => markTouched('fullName')}
                aria-describedby={describedBy}
                aria-invalid={invalid}
              />
            )}
          </Field>

          <Field id="email" label="Email" error={errors.email}>
            {({ describedBy, invalid }) => (
              <input
                id="email"
                className={`input ${invalid ? 'input--error' : ''}`}
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => setField('email', event.target.value)}
                onBlur={() => markTouched('email')}
                aria-describedby={describedBy}
                aria-invalid={invalid}
              />
            )}
          </Field>

          <Field
            id="phone"
            label="Mobile number"
            error={errors.phone}
            hint="Example: 0300 1234567. Use a made-up number if you prefer."
          >
            {({ describedBy, invalid }) => (
              <input
                id="phone"
                className={`input ${invalid ? 'input--error' : ''}`}
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(event) => setField('phone', event.target.value)}
                onBlur={() => markTouched('phone')}
                aria-describedby={describedBy}
                aria-invalid={invalid}
              />
            )}
          </Field>

          <Field
            id="level"
            label="Your experience level"
            error={errors.level}
            hint="Intermediate and Advanced classes need matching experience."
          >
            {({ describedBy, invalid }) => (
              <select
                id="level"
                className={`input ${invalid ? 'input--error' : ''}`}
                value={form.level}
                onChange={(event) => setField('level', event.target.value)}
                onBlur={() => markTouched('level')}
                aria-describedby={describedBy}
                aria-invalid={invalid}
              >
                <option value="">Choose a level</option>
                {LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            )}
          </Field>

          <div className="field">
            <label className="check">
              <input
                id="agree"
                type="checkbox"
                checked={form.agree}
                onChange={(event) => setField('agree', event.target.checked)}
                onBlur={() => markTouched('agree')}
                aria-describedby={errors.agree ? 'agree-error' : undefined}
                aria-invalid={Boolean(errors.agree)}
              />
              <span>I understand this is a simulated booking and no payment will be taken.</span>
            </label>
            {errors.agree && (
              <p id="agree-error" className="field-error">
                {errors.agree}
              </p>
            )}
          </div>

          {submitError && (
            <p className="callout callout--error" role="alert">
              {submitError}
            </p>
          )}

          <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
            {submitting ? 'Booking…' : 'Confirm booking (simulated)'}
          </button>
        </form>

        <div>
          <PlanSummary summary={summary} />
          <section className="panel" aria-labelledby="items-heading">
            <h2 id="items-heading" className="panel__title">
              Classes
            </h2>
            <ul className="plain-list">
              {planLines.map(({ cls, seats }) => (
                <li key={cls.id}>
                  {cls.title} · {pluralize(seats, 'seat')}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
