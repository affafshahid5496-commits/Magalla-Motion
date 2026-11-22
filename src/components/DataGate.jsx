import { Outlet } from 'react-router-dom';
import { useApp } from '../state/AppState.jsx';

// Shows loading and failure states for every route that needs the timetable.
export default function DataGate() {
  const { status, error, retry } = useApp();

  if (status === 'loading') {
    return (
      <div className="state-box" role="status">
        <span className="spinner" aria-hidden="true" />
        <p>Loading the timetable…</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="state-box state-box--error" role="alert">
        <h1 className="state-box__title">The timetable did not load</h1>
        <p>{error || 'Something went wrong while loading classes.'}</p>
        <p className="hint">Your saved plan is safe. Try again to load the latest classes.</p>
        <button type="button" className="btn btn--primary" onClick={retry}>
          Retry
        </button>
      </div>
    );
  }

  return <Outlet />;
}
