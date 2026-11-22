import { useState } from 'react';
import { useApp } from '../state/AppState.jsx';

// Clearly labelled demonstration controls for the edge cases the assignment asks for.
export default function DemoControls() {
  const { demo, updateDemo, reload, simulateAvailabilityChange, resetDemo } = useApp();
  const [message, setMessage] = useState('');

  return (
    <details className="demo">
      <summary>Demo controls (for testing edge cases)</summary>
      <div className="demo__body">
        <label className="check">
          <input
            type="checkbox"
            checked={demo.failLoad}
            onChange={(event) => updateDemo({ failLoad: event.target.checked })}
          />
          <span>Make the next timetable load fail</span>
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={demo.emptyTimetable}
            onChange={(event) => updateDemo({ emptyTimetable: event.target.checked })}
          />
          <span>Return an empty timetable</span>
        </label>
        <div className="demo__buttons">
          <button type="button" className="btn btn--secondary" onClick={reload}>
            Reload timetable now
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => setMessage(simulateAvailabilityChange().message)}
          >
            Simulate availability change
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => {
              resetDemo();
              setMessage('Demo settings reset.');
            }}
          >
            Reset demo settings
          </button>
        </div>
        <p className="hint" role="status">
          {message}
        </p>
      </div>
    </details>
  );
}
