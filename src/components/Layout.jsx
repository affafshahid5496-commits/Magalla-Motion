import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import DemoControls from './DemoControls.jsx';
import { useApp } from '../state/AppState.jsx';
import { BOOKING_CUTOFF_MINUTES } from '../rules/cutoff.js';
import { MAX_SEATS_PER_BOOKING } from '../rules/seatLimit.js';

export default function Layout() {
  const { planSeatCount, planIssues } = useApp();
  const { pathname } = useLocation();

  // Start each new page at the top (filter changes keep the same pathname, so they do not scroll).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <header className="site-header">
        <div className="container site-header__inner">
          <Link to="/" className="brand" aria-label="Margalla Motion, home">
            <span className="brand__mark" aria-hidden="true">
              ▲
            </span>
            Margalla Motion
          </Link>
          <nav aria-label="Main">
            <ul className="nav">
              <li>
                <NavLink to="/" end>
                  Classes
                </NavLink>
              </li>
              <li>
                <NavLink to="/plan">
                  My plan
                  {planSeatCount > 0 && (
                    <span className="count" aria-label={`${planSeatCount} seats in your plan`}>
                      {planSeatCount}
                    </span>
                  )}
                  {planIssues.length > 0 && <span className="count count--warn"> needs attention</span>}
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="container main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>
            <strong>Margalla Motion</strong> is a fictional studio in F-7 Markaz, Islamabad, made for a web
            programming assignment. Bookings are <strong>simulated</strong>: no payment is taken and no
            personal details are sent or saved.
          </p>
          <p className="hint">
            Booking rules: {MAX_SEATS_PER_BOOKING} seats per class at most · bookings close{' '}
            {BOOKING_CUTOFF_MINUTES / 60} hours before start · Intermediate and Advanced classes need matching
            experience.
          </p>
          <DemoControls />
        </div>
      </footer>
    </>
  );
}
