# Daily Mass Readings — Design

**Date:** 2026-05-14
**Status:** Approved

## Goal

Add a Catholic daily Mass readings feature to the Bible app: open a day and
read the full text of that day's Mass readings (First Reading, Responsorial
Psalm, Second Reading on Sundays/solemnities, Gospel), with the ability to
browse nearby dates.

## Decisions (from brainstorming)

- **Display:** full reading text inline on the page, not just citations.
- **Date range:** opens on today; prev/next day arrows and a date picker to
  browse nearby dates.
- **Translation:** the lectionary's native American English text, taken
  directly from the data source — not re-fetched in NRSV-CE. This keeps the
  Responsorial Psalm's proper refrain and verse selection intact.
- **Edge cases:** show the day's primary Mass only. No optional memorials,
  no alternate-reading branches.

## Data source

**Evangelizo feed** — `https://feed.evangelizo.org/v2/reader.php?type=xml&lang=AM&date=YYYYMMDD`

Verified characteristics:

- HTTPS, and sends `Access-Control-Allow-Origin: *` — reachable directly from
  the static GitHub Pages app, no proxy or backend needed.
- Returns XML with CDATA fields. Relevant elements:
  - `<litugic_t>` — liturgical day title (e.g. "Ascension of the Lord - Solemnity")
  - `<saint>` — saint of the day (may be empty)
  - `<reading_text1>` / `_lt` / `_st` — First Reading (text, long title, short title)
  - `<reading_text2>` / `_lt` / `_st` — Responsorial Psalm
  - `<reading_text3>` / `_lt` / `_st` — Second Reading (empty on weekdays)
  - `<reading_gospel>` / `_lt` / `_st` — Gospel
  - `<comment>` / `_t` / `_a` / `_s` — daily reflection (text, title, author, source)
- Reading text uses literal newlines between verses/lines.
- **Date window:** roughly today ±30 days. Out-of-window dates return an HTML
  error page instead of XML. This window matches the "browse nearby dates"
  decision; arbitrary historical browsing is out of scope.
- Rate limits are generous (100/sec, 2000/min); the localStorage cache keeps
  real usage far below that.

Rejected alternatives: USCCB (no API, no CORS), Universalis (paid license).

## Architecture

Approach A — runtime fetch + localStorage cache. This mirrors how the rest of
the app already works (chapter text is runtime-fetched from bolls.life and
cached). No build/CI changes.

Two files change:

- **`src/readings.js`** (new) — the data layer. Pure and self-contained: URL
  construction, fetch, XML parsing, localStorage caching, date-window helpers.
  This is the one genuinely error-prone part, so it is isolated and unit-tested.
- **`src/App.jsx`** — gains a `'readings'` view rendered inline alongside the
  existing `home` / `book` / `chapter` / `bookmarks` views, a header entry
  point, and a home-screen card.

### `src/readings.js`

Exports:

- `formatDate(date) -> "YYYYMMDD"` — formats a `Date` for the API and cache key.
- `addDays(date, n) -> Date`
- `today() -> Date` — normalized to local midnight.
- `minDate()` / `maxDate()` — today −30 / today +30, the browsable window.
- `clampDate(date) -> Date` — clamps into `[minDate, maxDate]`.
- `isSameDay(a, b) -> boolean`
- `parseReadingsXml(xmlString) -> Readings` — parses the Evangelizo XML.
  Throws `Error` if the document has no `<evangelizo>` root (the HTML error
  page case).
- `fetchReadings(date) -> Promise<Readings>` — checks `localStorage` key
  `readings:YYYYMMDD`; on miss, fetches the feed, parses, caches the parsed
  object as JSON, returns it. Propagates network errors and parse errors to
  the caller.

`Readings` shape:

```
{
  dateKey: "YYYYMMDD",
  liturgicalTitle: string,
  saint: string,            // "" when none
  readings: [
    { slot: "First Reading" | "Responsorial Psalm" | "Second Reading" | "Gospel",
      title: string,        // short title, e.g. "Acts 18,9-18."
      text: string }        // full text, newlines preserved
  ],
  reflection: {             // null when absent
    title: string, author: string, source: string, text: string
  }
}
```

Slot rules: `reading_text1` -> First Reading, `reading_text2` -> Responsorial
Psalm, `reading_text3` -> Second Reading (included only when its text is
non-empty after trim), `reading_gospel` -> Gospel. Order in the array is
First, Psalm, Second (if present), Gospel.

### `src/App.jsx` changes

New view value: `view` may now be `'readings'`.

New state:

- `readingsDate` — a `Date`, defaults to `today()`.
- `readingsData` — parsed `Readings` or `null`.
- `readingsLoading` — boolean.
- `readingsError` — string or `null`.
- `reflectionOpen` — boolean, collapsible reflection block. Defaults to
  `false` (collapsed).

New handlers:

- `openReadings()` — sets `view = 'readings'`, `readingsDate = today()`, and
  triggers a load. Also closes the mobile sidebar (consistent with other nav).
- `loadReadings(date)` — sets loading, calls `fetchReadings(clampDate(date))`,
  sets `readingsData` / `readingsError`, clears loading.
- `navReadingsDay(delta)` — `loadReadings(clampDate(addDays(readingsDate, delta)))`.

Entry points:

- **Header:** a calendar icon button (lucide `CalendarDays`) placed next to the
  existing bookmark button, `aria-label="Daily Mass readings"`, calls
  `openReadings()`.
- **Home screen:** a "Today's Mass Readings" card near the top of the `home`
  view (above "Continue Reading"). On `home` mount it lazily fetches today's
  readings to show the liturgical title as the card subtitle; tapping the card
  calls `openReadings()`. If that prefetch fails the card still renders with a
  generic label and remains tappable.

Readings view layout (inline `view === 'readings'` block, using the existing
theme tokens `bg`/`text`/`border`/`accent`/`hover` etc. and `fontSize`):

- Back-to-home link (matches `book` / `bookmarks` views).
- Date bar: ‹ prev button, the formatted date + a native `<input type="date">`
  with `min`/`max` set to the window, next › button. Prev disabled at
  `minDate()`, next disabled at `maxDate()`.
- Liturgical title (serif, prominent) and saint line (muted) when present.
- Loading: the existing centered `Loader2` spinner.
- Error: the existing error card with a "Try again" button calling
  `loadReadings(readingsDate)`.
- On success: each reading as a section — slot label (uppercase, tracked,
  accent color), short title (serif), then the body text rendered with
  `white-space: pre-wrap` so the source newlines become line breaks, at the
  user's `fontSize`.
- Daily reflection: a collapsible block at the bottom (`reflectionOpen`),
  showing title, author, source, and text when expanded.

## Data flow

1. User taps the calendar icon or the home card -> `openReadings()` ->
   `view = 'readings'`, `readingsDate = today()` -> `loadReadings(today())`.
2. `loadReadings` -> `fetchReadings(date)`:
   - cache hit (`localStorage["readings:YYYYMMDD"]`) -> parse JSON, return.
   - cache miss -> `fetch` the feed -> `DOMParser` -> `parseReadingsXml` ->
     write parsed object to `localStorage` -> return.
3. Component renders from `readingsData`.
4. Prev/next arrows and the date input call `navReadingsDay` / `loadReadings`
   with a clamped date.

Cache entries are a few KB each; the window is only ~60 days wide, so no
eviction logic is needed.

## Error handling

- **Network failure / non-200:** `fetchReadings` throws; `loadReadings` sets
  `readingsError` to a friendly message; the error card with "Try again" shows.
- **Malformed response:** out-of-window dates return an HTML error page.
  `parseReadingsXml` checks for the `<evangelizo>` root element and throws when
  it is missing; handled the same as a network error.
- **Date outside window:** prevented three ways — arrows disable at the bounds,
  the date input has `min`/`max`, and `clampDate` is applied defensively before
  every fetch.
- **Missing Second Reading:** `reading_text3` is empty on weekdays; the parser
  omits that slot, and the view simply renders one fewer section.
- **Missing saint / reflection:** rendered conditionally; absence is normal.
- **HTML entities / whitespace:** CDATA content is used as-is and `.trim()`ed;
  `pre-wrap` preserves intended line breaks without introducing markup.

## Testing

The project has no test setup yet. Add **Vitest** (Vite-native, minimal
config) with one focused test file, `src/readings.test.js`:

- `parseReadingsXml` — a weekday fixture (no Second Reading) yields three
  readings in the right slots; a Sunday/solemnity fixture yields four; an
  HTML-error-page fixture throws.
- Date helpers — `formatDate`, `addDays`, `clampDate` behave at and across the
  window bounds.

`fetchReadings`' caching path can be covered with a stubbed `fetch` and a
stubbed `localStorage` if cheap; otherwise it is exercised manually. The
readings view itself is verified manually in the browser (golden path: today
loads; prev/next within window; bounds disable correctly; a forced fetch
failure shows the error card and "Try again" recovers).

`package.json` gains a `"test": "vitest run"` script and `vitest` as a
devDependency. The CI workflow is not required to run tests for this change,
but may later.

## Out of scope

- Arbitrary historical dates (beyond the ±30-day source window).
- Optional memorials, alternate readings, vigil Masses.
- Re-fetching reading text in NRSV-CE.
- Linking a reading's citation into the chapter reader (possible later polish;
  the lectionary citation format would need a dedicated parser).
- Offline support beyond the incidental localStorage cache.
