# Margalla Motion

**CS4032 Web Programming, Assignment 02 (Fall 2026)**
Student: `<Your Name>` · Roll No: `<Roll No>` · Section: `<Section>`

A React website for **Margalla Motion**, a fictional group-fitness studio in F-7 Markaz, Islamabad. Students and young professionals browse classes, search and filter them, open a details page, build a plan of seats, fill in a booking form, review a calculated summary and reach a confirmation.

> All bookings are **simulated**. No payment is taken, no data is sent anywhere, and the form details are never saved.

- GitHub: `<paste public repository link>`
- Deployment: `<paste deployed link>`
- Final commit: `<paste hash>`

## Commands

```bash
npm install        # install dependencies
npm run dev        # development server (http://localhost:5173)
npm run build      # production build into dist/
npm run preview    # serve the production build locally
npm test           # runs: node --test  (Node.js built-in test runner)
```

Node 20 or newer is recommended.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Class timetable with search, filters, sort and quick add |
| `/classes/:id` | Class details, booking conditions and seat selection (invalid ids show a helpful message) |
| `/plan` | The selected classes: change seats, remove, fix conflicts, see the summary |
| `/checkout` | Controlled booking form with validation and the summary |
| `/confirmation/:ref` | Confirmation of the simulated booking |
| `*` | Not-found page |

## Features

- 15 classes in local data, loaded by an **asynchronous mock loader** with loading, failure and retry states.
- Search (title, coach, type, level, description) combined with type filter, level filter, "bookable now" filter and four sort orders. These live in the URL, so Back, refresh and shared links keep them. The chosen sort order is remembered.
- Plan is saved in local storage and **re-checked against current data and rules** every time (restored selections, availability changes, cut-off passing).
- Three operating rules (see below), shown next to the controls and enforced in the interface.
- Derived summary: classes, seats, total class time, subtotal, group discount and total.
- Keyboard-friendly, labelled form controls, visible focus, text alongside colour for every status.

## Operating rules

| # | Rule | Where users see it | What happens | Boundary case |
| --- | --- | --- | --- | --- |
| 1 Capacity | A booking takes **1 to 4 seats** per class and never more than the seats left | Beside the seat control, in the details page conditions, header chips and footer | Out-of-range value shows a specific message and the Add button is disabled; restored plans that break it get a "Change to N seats" fix | 4 seats is accepted, 5 is rejected |
| 2 Eligibility | Experience level (Beginner < Intermediate < Advanced) must meet the class level | Level on cards and details, level field in checkout | Checkout is blocked with a message naming the class | A Beginner booking an Advanced class is blocked; Advanced booking Intermediate is allowed |
| 3 Fulfilment | Bookings **close 120 minutes before start**; 3 or more seats in one class get 10% off | Details page conditions (with the exact closing time), status badge, plan summary | Closed classes cannot be added, and closed classes in a saved plan are flagged | Exactly 120 minutes before is allowed, 119 is not |

The tested rule is rule 1: `src/rules/seatLimit.js`, tested by `tests/seatLimit.test.js` (valid 2 seats, exactly 4, 5 above limit, plus extras).

## Reproducing edge cases

Open **Demo controls** in the page footer.

| Case | How to reproduce |
| --- | --- |
| Loading failure + retry | Tick "Make the next timetable load fail", press "Reload timetable now". Press **Retry** on the error screen. |
| Empty timetable (empty dataset) | Tick "Return an empty timetable". |
| No search matches | Search for `zzzz`. |
| Invalid class id | Visit `/classes/nope`. |
| Invalid route | Visit `/anything/else`. |
| Availability changed under a saved plan | Add 2 classes (2 seats in the second), press "Simulate availability change", open `/plan`. First class is full, second has too many seats; use the fix buttons. |
| Selection hidden by filters | Add a Cardio class, then filter by Dance. |
| Closed booking window | The "Lunch-Break Express" and "Mobility Reset" classes are scheduled today, so they close as the day goes on. |
| Long title, missing instructor | "Weekend Full-Body Strength and Conditioning Challenge…" has a very long title and no coach. |
| Saved plan restored | Add a class, refresh the page. |
| Reset | "Reset demo settings", or clear site data. |

## Simulated operations and limits

- "Confirm booking" only waits 0.7 seconds and writes a reference to local storage. No server exists.
- Only the last confirmation (no name, email or phone) is kept, so a refresh of `/confirmation/:ref` still works on that device.
- Seat counts booked in this browser reduce availability in this browser only.
- No cancellation, accounts or real payment.

## Concept map

| Concept | File | Component / function |
| --- | --- | --- |
| Routing, nested routes | `src/App.jsx` | `<Routes>`, `DataGate` layout route |
| URL params | `src/pages/ClassDetailPage.jsx` | `useParams` |
| Search params as state | `src/pages/ClassesPage.jsx` | `useSearchParams`, `updateParam` |
| Shared state, functional updates | `src/state/AppState.jsx` | `AppProvider`, `setSeats`, `removeFromPlan` |
| Immutable array/object updates | `src/state/AppState.jsx` | `setSeats` (map / spread) |
| Effects with cleanup | `src/state/AppState.jsx` | loader effect (`cancelled` flag), `setInterval` clock |
| Async code + failure handling | `src/services/mockLoader.js`, `AppState.jsx` | `loadClasses`, `.then/.catch` |
| Local storage | `src/services/storage.js` | `readJSON`, `writeJSON` |
| Props / callback props | `src/components/ClassCard.jsx` | `onAdd`, `onRemove` |
| Controlled inputs | `src/components/SeatControl.jsx`, `src/pages/CheckoutPage.jsx` | `value` + `onChange` |
| Derived values | `src/state/AppState.jsx`, `src/rules/pricing.js` | `summary`, `summarizePlan` |
| Conditional rendering | `src/components/DataGate.jsx`, `ClassesPage.jsx` | loading / error / empty / no matches |
| Business rules | `src/rules/` | `validateSeatCount`, `checkEligibility`, `checkBookingCutoff`, `calculateLine` |
| Validation | `src/rules/formValidation.js` | `validateBookingForm` |
| Plan re-validation | `src/rules/planValidation.js` | `validatePlan`, `sanitizePlan` |
| Tests | `tests/` | `node:test` + `node:assert/strict` |

## Deployment

The app is a single-page app, so the host must serve `index.html` for every path. This repository includes `vercel.json` (Vercel) and `public/_redirects` (Netlify) for that. After deploying, open `/classes/sunrise-yoga` directly and refresh to confirm.

## Assets

All illustrations are CSS tiles with emoji characters. No third-party images, templates or UI kits are used. Only `react`, `react-dom` and `react-router-dom` are runtime dependencies.
