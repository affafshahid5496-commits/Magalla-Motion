# Frontend Decisions

> **Before submitting:** the "Problem" entries below describe the three problems this site was built to fix.
> Replace the bracketed evidence with what you actually observed on your reference gym/fitness websites
> (URL, screenshot, steps). Only claim what you saw.

## Decision 1: Keep search, filters and sort in the URL, and never silently drop selections (interaction / state)

| Field | Content |
| --- | --- |
| **Problem** | Navigation resets filters or selections: after opening a class and going back, the timetable is back to its default state and the visitor loses their place. `[Reference URL + screenshot + steps: your observation]` |
| **Decision** | Search, type, level, "bookable now" and sort are stored in the URL query string (`?q=yoga&cat=Dance`). Selections live in shared state and local storage, so they survive filtering. When a filter hides selected classes, a banner names them and offers "Clear filters". |
| **Alternative** | Keep filter state in component `useState` (lost on navigation) or in a global context only (lost on refresh and not shareable). |
| **Reason** | People compare classes across types and day-by-day. The browser Back button should return them to exactly what they were looking at, and a link should reproduce a view. The plan must not change just because a filter changed. |
| **Tradeoff** | More code (parameter parsing, defaults) and a longer URL. The banner adds a line of text above results that some visitors may not need. |
| **Code location** | `src/pages/ClassesPage.jsx`: `updateParam`, `hiddenSelections`; `src/state/AppState.jsx`: `plan`, `setSeats` |
| **Evidence** | `[Screenshot + steps]` 1. Filter by Dance. 2. Open a class. 3. Press Back: filter still applied. 4. Add a Cardio class, filter by Dance: banner names the hidden selection. |

## Decision 2: Put price, seats left, level and booking conditions where the choice is made (information hierarchy)

| Field | Content |
| --- | --- |
| **Problem** | Listings leave out information needed to compare options, and conditions or charges appear late (at checkout). `[Reference URL + screenshot + steps: your observation]` |
| **Decision** | Every card shows time, length, price per seat, coach, level requirement and an availability badge with text ("Only 1 seat left", "Full", "Booking closed"). The details page opens with a key-facts block, then "Booking conditions" (seat limit, exact closing time, group discount, level), then the long description. The same rules appear in the hero chips and footer. |
| **Alternative** | Keep cards minimal (title and image) and reveal price and conditions only on the details page or in the final step. |
| **Reason** | Visitors avoid spending time on a class they cannot book, and nobody meets a surprise limit at the end. Clear conditions support the business goal of completed bookings, not abandoned ones. |
| **Tradeoff** | Denser cards and more text to scan. Needs careful spacing so the title stays the first thing seen. |
| **Code location** | `src/components/ClassCard.jsx`; `src/pages/ClassDetailPage.jsx` (Key facts, Booking conditions); `src/rules/availability.js`: `getClassStatus` |
| **Evidence** | `[Screenshot + steps]` 1. Open `/`: price, seats and level visible without clicking. 2. Open any class: conditions appear above the description. |

## Decision 3: Sticky booking panel and explicit, specific errors on mobile (mobile layout)

| Field | Content |
| --- | --- |
| **Problem** | Important controls are difficult to use on mobile, and form errors are unclear or valid input is cleared. `[Reference URL + screenshot at phone width + steps: your observation]` |
| **Decision** | At 600 px and below the booking panel sticks to the bottom of the screen, so price, seat control and the primary button stay reachable while reading. Controls are at least 44 px high. In checkout, every error is specific, is announced in a summary that receives focus, and all valid input is kept. |
| **Alternative** | Put the booking panel at the bottom of the page (needs a long scroll), or use a separate full-screen booking step. |
| **Reason** | Students book on their phones between lectures. Keeping the main action in thumb reach reduces scrolling, and keeping typed values avoids repeated work. |
| **Tradeoff** | The sticky panel covers part of the screen and needs a `max-height` with its own scroll. Validation summary plus inline errors repeats each message. |
| **Code location** | `src/styles/global.css`: `@media (max-width: 600px)` `.booking-panel`; `src/pages/CheckoutPage.jsx`: `errors`, `summaryRef`; `src/rules/formValidation.js` |
| **Evidence** | `[Screenshot at 390 px + steps]` 1. Open a class at 390 px width: panel is pinned at the bottom. 2. In checkout, submit with a bad email: name stays filled, message names the problem. |
