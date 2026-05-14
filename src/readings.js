// ============================================================
// DAILY MASS READINGS — data layer
// Source: Evangelizo feed (https, CORS-enabled, ~today ±30 days).
// Pure functions + a cached fetch; the view lives in App.jsx.
// ============================================================

const FEED_URL = 'https://feed.evangelizo.org/v2/reader.php';
const WINDOW_DAYS = 30;

// Element name -> reading slot label. Order here is display order.
const SLOTS = [
  { el: 'reading_text1', slot: 'First Reading' },
  { el: 'reading_text2', slot: 'Responsorial Psalm' },
  { el: 'reading_text3', slot: 'Second Reading' },
  { el: 'reading_gospel', slot: 'Gospel' },
];

// ─── Date helpers ─────────────────────────────────────────────
export function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function minDate() {
  return addDays(today(), -WINDOW_DAYS);
}

export function maxDate() {
  return addDays(today(), WINDOW_DAYS);
}

export function clampDate(date) {
  const lo = minDate();
  const hi = maxDate();
  if (date < lo) return lo;
  if (date > hi) return hi;
  return date;
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// "YYYYMMDD" — the format the feed and the cache key use.
export function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

// "YYYY-MM-DD" — the format <input type="date"> uses.
export function formatISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// "YYYY-MM-DD" -> local Date at midnight.
export function parseISO(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// ─── XML parsing ──────────────────────────────────────────────
export function parseReadingsXml(xmlString) {
  const doc = new DOMParser().parseFromString(xmlString, 'text/xml');
  const root = doc.getElementsByTagName('evangelizo')[0];
  if (!root || doc.getElementsByTagName('parsererror').length > 0) {
    throw new Error('Unexpected response from the readings service.');
  }

  const get = (tag) => {
    const el = root.getElementsByTagName(tag)[0];
    return el ? el.textContent.trim() : '';
  };

  const readings = [];
  for (const { el, slot } of SLOTS) {
    const text = get(el);
    if (!text) continue;
    readings.push({ slot, title: get(`${el}_st`) || get(`${el}_lt`), text });
  }

  const commentText = get('comment');
  const reflection = commentText
    ? {
        title: get('comment_t'),
        author: get('comment_a'),
        source: get('comment_s'),
        text: commentText,
      }
    : null;

  return {
    liturgicalTitle: get('litugic_t'),
    saint: get('saint'),
    readings,
    reflection,
  };
}

// ─── Cached fetch ─────────────────────────────────────────────
export async function fetchReadings(date) {
  const key = `readings:${formatDate(date)}`;

  try {
    const cached = localStorage.getItem(key);
    if (cached) return JSON.parse(cached);
  } catch (e) {}

  const url = `${FEED_URL}?type=xml&lang=AM&date=${formatDate(date)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const parsed = parseReadingsXml(await res.text());
  if (parsed.readings.length === 0) {
    throw new Error('No readings found for this date.');
  }

  try {
    localStorage.setItem(key, JSON.stringify(parsed));
  } catch (e) {}

  return parsed;
}
