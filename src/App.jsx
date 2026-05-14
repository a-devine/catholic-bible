import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Book, Search, Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, Sun, Moon, X, BookOpen, Loader2, Menu, Plus, Minus, ChevronDown, Home, ArrowRight, Sparkles, Copy, Check, Cross, History } from 'lucide-react';

// ============================================================
// CATHOLIC BIBLE STRUCTURE — 73 books
// IDs below are in Catholic canonical order; they are remapped
// to bolls.life's book IDs via BOLLS_ID before fetching.
// Translation: NRSV Catholic Edition (NRSVCE).
// ============================================================
const BIBLE_DATA = {
  old: {
    label: 'Old Testament',
    sections: [
      {
        name: 'Pentateuch',
        tag: 'The Law',
        books: [
          { id: 1, name: 'Genesis', abbr: 'Gen', chapters: 50, intro: 'Origins — creation, the patriarchs, and the covenant with Abraham.' },
          { id: 2, name: 'Exodus', abbr: 'Ex', chapters: 40, intro: 'Liberation from Egypt and the giving of the Law at Sinai.' },
          { id: 3, name: 'Leviticus', abbr: 'Lev', chapters: 27, intro: 'Priestly laws and the call to holiness.' },
          { id: 4, name: 'Numbers', abbr: 'Num', chapters: 36, intro: 'Wilderness wanderings on the way to the Promised Land.' },
          { id: 5, name: 'Deuteronomy', abbr: 'Deut', chapters: 34, intro: "Moses' final discourses and renewal of the covenant." },
        ]
      },
      {
        name: 'Historical Books',
        tag: 'Israel\'s Story',
        books: [
          { id: 6, name: 'Joshua', abbr: 'Jos', chapters: 24, intro: 'Conquest and division of the Promised Land.' },
          { id: 7, name: 'Judges', abbr: 'Jdg', chapters: 21, intro: 'The cycles of apostasy and deliverance through judges.' },
          { id: 8, name: 'Ruth', abbr: 'Rut', chapters: 4, intro: 'Loyalty, redemption, and the lineage of David.' },
          { id: 9, name: '1 Samuel', abbr: '1 Sam', chapters: 31, intro: 'Samuel, Saul, and the rise of David.' },
          { id: 10, name: '2 Samuel', abbr: '2 Sam', chapters: 24, intro: "David's reign and the everlasting covenant." },
          { id: 11, name: '1 Kings', abbr: '1 Kgs', chapters: 22, intro: 'Solomon, the divided kingdom, and Elijah.' },
          { id: 12, name: '2 Kings', abbr: '2 Kgs', chapters: 25, intro: 'The fall of Israel and Judah; exile.' },
          { id: 13, name: '1 Chronicles', abbr: '1 Chr', chapters: 29, intro: "David's reign retold from a priestly perspective." },
          { id: 14, name: '2 Chronicles', abbr: '2 Chr', chapters: 36, intro: 'The kings of Judah and the temple.' },
          { id: 15, name: 'Ezra', abbr: 'Ezr', chapters: 10, intro: 'Return from exile and rebuilding the temple.' },
          { id: 16, name: 'Nehemiah', abbr: 'Neh', chapters: 13, intro: 'Rebuilding the walls of Jerusalem.' },
          { id: 17, name: 'Tobit', abbr: 'Tob', chapters: 14, deutero: true, intro: 'A righteous family, the angel Raphael, and divine providence.' },
          { id: 18, name: 'Judith', abbr: 'Jdt', chapters: 16, deutero: true, intro: 'A widow\'s courage delivers her people.' },
          { id: 19, name: 'Esther', abbr: 'Est', chapters: 10, intro: 'A queen saves her people; the origin of Purim.' },
          { id: 20, name: '1 Maccabees', abbr: '1 Mac', chapters: 16, deutero: true, intro: 'The Maccabean revolt and rededication of the temple.' },
          { id: 21, name: '2 Maccabees', abbr: '2 Mac', chapters: 15, deutero: true, intro: 'Martyrs, miracles, and prayer for the dead.' },
        ]
      },
      {
        name: 'Wisdom Books',
        tag: 'Poetry & Reflection',
        books: [
          { id: 22, name: 'Job', abbr: 'Job', chapters: 42, intro: 'Suffering, faith, and the mystery of God.' },
          { id: 23, name: 'Psalms', abbr: 'Ps', chapters: 150, intro: 'The prayer book of the Church — 150 hymns.' },
          { id: 24, name: 'Proverbs', abbr: 'Prov', chapters: 31, intro: 'Practical wisdom for righteous living.' },
          { id: 25, name: 'Ecclesiastes', abbr: 'Eccl', chapters: 12, intro: 'Vanity of vanities — the search for meaning.' },
          { id: 26, name: 'Song of Songs', abbr: 'Song', chapters: 8, intro: 'A love poem; an allegory of God and his people.' },
          { id: 27, name: 'Wisdom', abbr: 'Wis', chapters: 19, deutero: true, intro: 'Wisdom personified, immortality, and divine justice.' },
          { id: 28, name: 'Sirach', abbr: 'Sir', chapters: 51, deutero: true, intro: 'Ben Sira\'s wisdom — the longest deuterocanonical book.' },
        ]
      },
      {
        name: 'Prophetic Books',
        tag: 'The Prophets',
        books: [
          { id: 29, name: 'Isaiah', abbr: 'Isa', chapters: 66, intro: 'Judgment, comfort, and the Suffering Servant.' },
          { id: 30, name: 'Jeremiah', abbr: 'Jer', chapters: 52, intro: 'The weeping prophet warns of exile.' },
          { id: 31, name: 'Lamentations', abbr: 'Lam', chapters: 5, intro: 'Mourning the fall of Jerusalem.' },
          { id: 32, name: 'Baruch', abbr: 'Bar', chapters: 6, deutero: true, intro: "Jeremiah's scribe writes from exile." },
          { id: 33, name: 'Ezekiel', abbr: 'Ezk', chapters: 48, intro: 'Visions, judgment, and the new temple.' },
          { id: 34, name: 'Daniel', abbr: 'Dan', chapters: 14, intro: 'Apocalyptic visions and faithful exiles in Babylon.' },
          { id: 35, name: 'Hosea', abbr: 'Hos', chapters: 14, intro: "God's faithful love for an unfaithful people." },
          { id: 36, name: 'Joel', abbr: 'Joel', chapters: 3, intro: 'The Day of the Lord and the outpouring of the Spirit.' },
          { id: 37, name: 'Amos', abbr: 'Amos', chapters: 9, intro: 'Justice for the poor; judgment on the powerful.' },
          { id: 38, name: 'Obadiah', abbr: 'Obad', chapters: 1, intro: 'Judgment on Edom in a single chapter.' },
          { id: 39, name: 'Jonah', abbr: 'Jon', chapters: 4, intro: 'A reluctant prophet and God\'s mercy on Nineveh.' },
          { id: 40, name: 'Micah', abbr: 'Mic', chapters: 7, intro: 'Justice, mercy, and humility before God.' },
          { id: 41, name: 'Nahum', abbr: 'Nah', chapters: 3, intro: 'The fall of Nineveh.' },
          { id: 42, name: 'Habakkuk', abbr: 'Hab', chapters: 3, intro: 'Wrestling with God over justice.' },
          { id: 43, name: 'Zephaniah', abbr: 'Zeph', chapters: 3, intro: 'The Day of the Lord and the faithful remnant.' },
          { id: 44, name: 'Haggai', abbr: 'Hag', chapters: 2, intro: 'A call to rebuild the temple.' },
          { id: 45, name: 'Zechariah', abbr: 'Zech', chapters: 14, intro: 'Visions of restoration and the coming Messiah.' },
          { id: 46, name: 'Malachi', abbr: 'Mal', chapters: 4, intro: 'The final word before centuries of silence.' },
        ]
      },
    ]
  },
  new: {
    label: 'New Testament',
    sections: [
      {
        name: 'The Gospels',
        tag: 'The Good News',
        books: [
          { id: 47, name: 'Matthew', abbr: 'Matt', chapters: 28, intro: 'Jesus as the promised Messiah and new Moses.' },
          { id: 48, name: 'Mark', abbr: 'Mk', chapters: 16, intro: 'The earliest, most urgent Gospel — Jesus the Servant.' },
          { id: 49, name: 'Luke', abbr: 'Lk', chapters: 24, intro: 'Jesus as Savior of the poor, women, and outcasts.' },
          { id: 50, name: 'John', abbr: 'Jn', chapters: 21, intro: 'The Word made flesh — signs and discourses.' },
        ]
      },
      {
        name: 'Acts of the Apostles',
        tag: 'The Early Church',
        books: [
          { id: 51, name: 'Acts', abbr: 'Acts', chapters: 28, intro: 'The Spirit\'s work from Jerusalem to Rome.' },
        ]
      },
      {
        name: 'Pauline Epistles',
        tag: "St. Paul's Letters",
        books: [
          { id: 52, name: 'Romans', abbr: 'Rom', chapters: 16, intro: "Paul's longest theological letter — the gospel of grace." },
          { id: 53, name: '1 Corinthians', abbr: '1 Cor', chapters: 16, intro: 'Unity, love, and the resurrection.' },
          { id: 54, name: '2 Corinthians', abbr: '2 Cor', chapters: 13, intro: "Paul's defense of his ministry; the treasure in clay jars." },
          { id: 55, name: 'Galatians', abbr: 'Gal', chapters: 6, intro: 'Justification by faith, not the Law.' },
          { id: 56, name: 'Ephesians', abbr: 'Eph', chapters: 6, intro: 'The cosmic Christ and the unity of the Church.' },
          { id: 57, name: 'Philippians', abbr: 'Phil', chapters: 4, intro: 'Joy in suffering; rejoice in the Lord always.' },
          { id: 58, name: 'Colossians', abbr: 'Col', chapters: 4, intro: 'The supremacy of Christ over all things.' },
          { id: 59, name: '1 Thessalonians', abbr: '1 Thess', chapters: 5, intro: "Paul's earliest letter — the Lord's coming." },
          { id: 60, name: '2 Thessalonians', abbr: '2 Thess', chapters: 3, intro: 'The Day of the Lord and standing firm.' },
          { id: 61, name: '1 Timothy', abbr: '1 Tim', chapters: 6, intro: 'Pastoral guidance for Church leaders.' },
          { id: 62, name: '2 Timothy', abbr: '2 Tim', chapters: 4, intro: "Paul's farewell — fight the good fight." },
          { id: 63, name: 'Titus', abbr: 'Tit', chapters: 3, intro: 'Sound doctrine and good works.' },
          { id: 64, name: 'Philemon', abbr: 'Phlm', chapters: 1, intro: 'A short, personal plea for a runaway slave.' },
          { id: 65, name: 'Hebrews', abbr: 'Heb', chapters: 13, intro: 'Christ as the great High Priest, fulfillment of the Old Covenant.' },
        ]
      },
      {
        name: 'Catholic Epistles',
        tag: 'General Letters',
        books: [
          { id: 66, name: 'James', abbr: 'Jas', chapters: 5, intro: 'Faith without works is dead.' },
          { id: 67, name: '1 Peter', abbr: '1 Pet', chapters: 5, intro: 'Hope and holiness amid suffering.' },
          { id: 68, name: '2 Peter', abbr: '2 Pet', chapters: 3, intro: 'Warnings against false teachers.' },
          { id: 69, name: '1 John', abbr: '1 Jn', chapters: 5, intro: 'God is love — abide in him.' },
          { id: 70, name: '2 John', abbr: '2 Jn', chapters: 1, intro: 'A short letter on truth and love.' },
          { id: 71, name: '3 John', abbr: '3 Jn', chapters: 1, intro: 'Hospitality and Christian fellowship.' },
          { id: 72, name: 'Jude', abbr: 'Jud', chapters: 1, intro: 'Contend for the faith.' },
        ]
      },
      {
        name: 'Revelation',
        tag: 'The Apocalypse',
        books: [
          { id: 73, name: 'Revelation', abbr: 'Rev', chapters: 22, intro: 'Visions of the end and the new creation.' },
        ]
      },
    ]
  }
};

const FEATURED = [
  { ref: 'Genesis 1', bookId: 1, chapter: 1, label: 'In the Beginning', desc: 'The creation account', accent: 'amber' },
  { ref: 'Psalm 23', bookId: 23, chapter: 23, label: 'The Lord is my Shepherd', desc: 'Comfort in any season', accent: 'emerald' },
  { ref: 'Isaiah 53', bookId: 29, chapter: 53, label: 'The Suffering Servant', desc: 'Prophecy of the Messiah', accent: 'violet' },
  { ref: 'Matthew 5', bookId: 47, chapter: 5, label: 'The Beatitudes', desc: 'The Sermon on the Mount', accent: 'sky' },
  { ref: 'John 1', bookId: 50, chapter: 1, label: 'The Word Became Flesh', desc: 'The Incarnation', accent: 'rose' },
  { ref: '1 Corinthians 13', bookId: 53, chapter: 13, label: 'The Way of Love', desc: "St. Paul's hymn to charity", accent: 'pink' },
];

// All books flat array, in canonical order
const ALL_BOOKS = [];
['old', 'new'].forEach(t => {
  BIBLE_DATA[t].sections.forEach(s => {
    s.books.forEach(b => ALL_BOOKS.push({ ...b, testament: t, section: s.name }));
  });
});

// Maps our Catholic-canonical book IDs to bolls.life's book IDs.
// bolls.life orders the deuterocanonical books separately (68-75),
// so they don't line up with our 1-73 canonical numbering.
const BOLLS_ID = {
  17: 68, // Tobit
  18: 69, // Judith
  19: 17, // Esther
  20: 74, // 1 Maccabees
  21: 75, // 2 Maccabees
  22: 18, // Job
  23: 19, // Psalms
  24: 20, // Proverbs
  25: 21, // Ecclesiastes
  26: 22, // Song of Songs
  27: 70, // Wisdom
  28: 71, // Sirach
  29: 23, // Isaiah
  30: 24, // Jeremiah
  31: 25, // Lamentations
  32: 73, // Baruch
  33: 26, // Ezekiel
  34: 27, // Daniel
  35: 28, // Hosea
  36: 29, // Joel
  37: 30, // Amos
  38: 31, // Obadiah
  39: 32, // Jonah
  40: 33, // Micah
  41: 34, // Nahum
  42: 35, // Habakkuk
  43: 36, // Zephaniah
  44: 37, // Haggai
  45: 38, // Zechariah
  46: 39, // Malachi
  // New Testament: our 47-73 maps to bolls.life 40-66
  47: 40, 48: 41, 49: 42, 50: 43, 51: 44, 52: 45, 53: 46, 54: 47,
  55: 48, 56: 49, 57: 50, 58: 51, 59: 52, 60: 53, 61: 54, 62: 55,
  63: 56, 64: 57, 65: 58, 66: 59, 67: 60, 68: 61, 69: 62, 70: 63,
  71: 64, 72: 65, 73: 66,
};
const bollsId = (id) => BOLLS_ID[id] || id;

// Reference parser: "John 3:16", "1 cor 13", "ps 23"
function parseReference(input) {
  if (!input) return null;
  const cleaned = input.trim().toLowerCase();
  // Match: optional number prefix + name + chapter + optional :verse
  const match = cleaned.match(/^(\d?\s*[a-z]+)\s+(\d+)(?::(\d+))?$/);
  if (!match) return null;
  const [, namePart, chap, verse] = match;
  const normalizedName = namePart.replace(/\s+/g, ' ').trim();

  const book = ALL_BOOKS.find(b => {
    const bn = b.name.toLowerCase();
    const ba = b.abbr.toLowerCase();
    return bn === normalizedName || ba === normalizedName ||
           bn.startsWith(normalizedName) || ba.startsWith(normalizedName);
  });

  if (!book) return null;
  const c = parseInt(chap, 10);
  if (c < 1 || c > book.chapters) return null;
  return { book, chapter: c, verse: verse ? parseInt(verse, 10) : null };
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function CatholicBibleApp() {
  const [view, setView] = useState('home'); // home | book | chapter | bookmarks | search
  const [book, setBook] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [verses, setVerses] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState(18);
  const [bookmarks, setBookmarks] = useState([]);
  const [history, setHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTestament, setActiveTestament] = useState('old');
  const [openSection, setOpenSection] = useState('Pentateuch');
  const [refInput, setRefInput] = useState('');
  const [refError, setRefError] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [highlightVerse, setHighlightVerse] = useState(null);
  const [copiedRef, setCopiedRef] = useState(null);

  const readingPaneRef = useRef(null);

  // ─── Persisted storage (localStorage) ─────────────────────────
  useEffect(() => {
    try {
      const b = localStorage.getItem('bookmarks');
      if (b) setBookmarks(JSON.parse(b));
    } catch (e) {}
    try {
      const h = localStorage.getItem('history');
      if (h) setHistory(JSON.parse(h));
    } catch (e) {}
    try {
      const s = localStorage.getItem('settings');
      if (s) {
        const { theme: t, fontSize: f } = JSON.parse(s);
        if (t) setTheme(t);
        if (f) setFontSize(f);
      }
    } catch (e) {}
  }, []);

  const persistBookmarks = useCallback((next) => {
    try { localStorage.setItem('bookmarks', JSON.stringify(next)); } catch (e) {}
  }, []);
  const persistHistory = useCallback((next) => {
    try { localStorage.setItem('history', JSON.stringify(next)); } catch (e) {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem('settings', JSON.stringify({ theme, fontSize })); } catch (e) {}
  }, [theme, fontSize]);

  // ─── Fetch chapter ────────────────────────────────────────────
  const fetchChapter = useCallback(async (bookData, chap, scrollToVerse = null) => {
    setLoading(true);
    setError(null);
    setVerses(null);
    setHighlightVerse(scrollToVerse);
    try {
      const res = await fetch(`https://bolls.life/get-text/NRSVCE/${bollsId(bookData.id)}/${chap}/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) throw new Error('Empty response');
      setVerses(data);

      // Update history
      const entry = { bookId: bookData.id, bookName: bookData.name, chapter: chap, ts: Date.now() };
      setHistory(prev => {
        const filtered = prev.filter(h => !(h.bookId === entry.bookId && h.chapter === entry.chapter));
        const next = [entry, ...filtered].slice(0, 12);
        persistHistory(next);
        return next;
      });
    } catch (err) {
      setError("Couldn't load this chapter. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [persistHistory]);

  // ─── Navigation handlers ──────────────────────────────────────
  const openBook = (b) => {
    setBook(b);
    setView('book');
    setSidebarOpen(false);
  };

  const openChapter = (b, chap, verse = null) => {
    setBook(b);
    setChapter(chap);
    setView('chapter');
    setSidebarOpen(false);
    fetchChapter(b, chap, verse);
    setTimeout(() => readingPaneRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  const navChapter = (delta) => {
    const newChap = chapter + delta;
    if (newChap >= 1 && newChap <= book.chapters) {
      openChapter(book, newChap);
    } else {
      const idx = ALL_BOOKS.findIndex(b => b.id === book.id);
      if (delta < 0 && idx > 0) {
        const prev = ALL_BOOKS[idx - 1];
        openChapter(prev, prev.chapters);
      } else if (delta > 0 && idx < ALL_BOOKS.length - 1) {
        const next = ALL_BOOKS[idx + 1];
        openChapter(next, 1);
      }
    }
  };

  // Scroll to highlighted verse after render
  useEffect(() => {
    if (verses && highlightVerse) {
      setTimeout(() => {
        const el = document.getElementById(`v-${highlightVerse}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [verses, highlightVerse]);

  // ─── Bookmarks ────────────────────────────────────────────────
  const toggleBookmark = (verseObj) => {
    const ref = `${book.name} ${chapter}:${verseObj.verse}`;
    const exists = bookmarks.find(b => b.ref === ref);
    let next;
    if (exists) {
      next = bookmarks.filter(b => b.ref !== ref);
    } else {
      next = [{
        ref, bookId: book.id, bookName: book.name,
        chapter, verse: verseObj.verse, text: verseObj.text,
        ts: Date.now()
      }, ...bookmarks];
    }
    setBookmarks(next);
    persistBookmarks(next);
  };
  const isBookmarked = (v) => bookmarks.some(b => b.ref === `${book?.name} ${chapter}:${v.verse}`);

  const copyVerse = async (v) => {
    const ref = `${book.name} ${chapter}:${v.verse}`;
    const cleaned = stripHtml(v.text);
    try {
      await navigator.clipboard.writeText(`"${cleaned}" — ${ref} (NRSV-CE)`);
      setCopiedRef(ref);
      setTimeout(() => setCopiedRef(null), 1500);
    } catch (e) {}
  };

  // ─── Reference search ─────────────────────────────────────────
  const handleRefSubmit = (e) => {
    e.preventDefault();
    const parsed = parseReference(refInput);
    if (parsed) {
      openChapter(parsed.book, parsed.chapter, parsed.verse);
      setRefInput('');
      setShowSearch(false);
      setRefError(false);
    } else {
      setRefError(true);
      setTimeout(() => setRefError(false), 1500);
    }
  };

  // ─── Theme styling ────────────────────────────────────────────
  const dark = theme === 'dark';
  const bg = dark ? 'bg-slate-950' : 'bg-stone-50';
  const bgPanel = dark ? 'bg-slate-900' : 'bg-white';
  const bgSubtle = dark ? 'bg-slate-900/60' : 'bg-stone-100';
  const text = dark ? 'text-stone-100' : 'text-stone-900';
  const textMuted = dark ? 'text-stone-400' : 'text-stone-600';
  const textSubtle = dark ? 'text-stone-500' : 'text-stone-500';
  const border = dark ? 'border-slate-800' : 'border-stone-200';
  const borderStrong = dark ? 'border-slate-700' : 'border-stone-300';
  const accent = dark ? 'text-amber-400' : 'text-amber-700';
  const accentBg = dark ? 'bg-amber-500/10' : 'bg-amber-50';
  const hover = dark ? 'hover:bg-slate-800' : 'hover:bg-stone-100';

  return (
    <div className={`${bg} ${text} min-h-screen flex flex-col font-sans transition-colors`} style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>

      {/* ═══ HEADER ═══ */}
      <header className={`sticky top-0 z-30 ${dark ? 'bg-slate-950/80' : 'bg-stone-50/80'} backdrop-blur-md border-b ${border}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg ${hover} transition lg:hidden`}
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => setView('home')}
            className="flex items-center gap-2 group"
          >
            <div className={`w-9 h-9 rounded-lg ${accentBg} flex items-center justify-center`}>
              <Cross className={`w-5 h-5 ${accent}`} />
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-serif text-lg leading-none">Sacred Scripture</div>
              <div className={`text-[10px] uppercase tracking-widest ${textSubtle} mt-0.5`}>Catholic Bible · NRSV-CE</div>
            </div>
          </button>

          <div className="flex-1" />

          {/* Reference search */}
          <form onSubmit={handleRefSubmit} className={`relative hidden md:flex items-center ${bgSubtle} border ${refError ? 'border-red-500' : border} rounded-lg transition-all`}>
            <Search className={`w-4 h-4 ml-3 ${textMuted}`} />
            <input
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              placeholder="Go to: John 3:16"
              className={`bg-transparent px-2 py-1.5 text-sm w-44 lg:w-56 outline-none ${text} placeholder:${textMuted}`}
            />
            <button type="submit" className={`px-2 py-1 text-xs ${accent} hover:opacity-70`}>Go</button>
          </form>

          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-2 rounded-lg ${hover} transition md:hidden`}
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={() => setView('bookmarks')}
            className={`relative p-2 rounded-lg ${hover} transition`}
            aria-label="Bookmarks"
          >
            <Bookmark className="w-5 h-5" />
            {bookmarks.length > 0 && (
              <span className={`absolute -top-0.5 -right-0.5 w-4 h-4 ${dark ? 'bg-amber-400 text-slate-900' : 'bg-amber-600 text-white'} rounded-full text-[10px] font-bold flex items-center justify-center`}>
                {bookmarks.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTheme(dark ? 'light' : 'dark')}
            className={`p-2 rounded-lg ${hover} transition`}
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile search drawer */}
        {showSearch && (
          <div className={`md:hidden border-t ${border} px-3 py-3`}>
            <form onSubmit={handleRefSubmit} className={`flex items-center ${bgSubtle} border ${refError ? 'border-red-500' : border} rounded-lg`}>
              <Search className={`w-4 h-4 ml-3 ${textMuted}`} />
              <input
                value={refInput}
                onChange={(e) => setRefInput(e.target.value)}
                placeholder="Go to: John 3:16"
                autoFocus
                className={`bg-transparent px-2 py-2 text-sm flex-1 outline-none`}
              />
              <button type="submit" className={`px-3 py-2 text-sm ${accent}`}>Go</button>
            </form>
          </div>
        )}

        {/* Breadcrumb / chapter title bar */}
        {view === 'chapter' && book && (
          <div className={`border-t ${border} px-3 sm:px-6 py-2 max-w-7xl mx-auto flex items-center justify-between`}>
            <div className="flex items-center gap-2 text-sm">
              <button onClick={() => setView('book')} className={`${textMuted} hover:${accent} transition`}>
                {book.name}
              </button>
              <ChevronRight className={`w-3 h-3 ${textSubtle}`} />
              <span className="font-medium">Chapter {chapter}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setFontSize(Math.max(14, fontSize - 1))} className={`p-1.5 rounded ${hover}`} aria-label="Decrease text">
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className={`text-xs ${textMuted} w-6 text-center`}>{fontSize}</span>
              <button onClick={() => setFontSize(Math.min(28, fontSize + 1))} className={`p-1.5 rounded ${hover}`} aria-label="Increase text">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ═══ BODY ═══ */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full">

        {/* ─── SIDEBAR ─── */}
        <aside
          className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
            fixed lg:sticky lg:top-[57px] inset-y-0 left-0 z-20 lg:z-0
            w-72 ${bgPanel} lg:bg-transparent border-r ${border}
            overflow-y-auto transition-transform
            lg:h-[calc(100vh-57px)]
          `}
        >
          {/* Mobile close */}
          <div className="lg:hidden flex justify-end p-2">
            <button onClick={() => setSidebarOpen(false)} className={`p-2 rounded ${hover}`}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Testament tabs */}
          <div className={`px-3 pt-2 pb-3 sticky top-0 ${bgPanel} lg:bg-stone-50 ${dark && 'lg:bg-slate-950'} z-10`}>
            <div className={`flex p-1 rounded-lg ${bgSubtle}`}>
              {['old', 'new'].map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTestament(t)}
                  className={`
                    flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition
                    ${activeTestament === t
                      ? `${dark ? 'bg-slate-700 text-amber-400' : 'bg-white text-amber-700 shadow-sm'}`
                      : `${textMuted} ${hover}`
                    }
                  `}
                >
                  {BIBLE_DATA[t].label}
                </button>
              ))}
            </div>
          </div>

          {/* Sections accordion */}
          <nav className="px-2 pb-6">
            {BIBLE_DATA[activeTestament].sections.map(section => {
              const isOpen = openSection === section.name;
              return (
                <div key={section.name} className="mb-1">
                  <button
                    onClick={() => setOpenSection(isOpen ? null : section.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg ${hover} transition group`}
                  >
                    <div className="text-left">
                      <div className="text-sm font-medium font-serif">{section.name}</div>
                      <div className={`text-[10px] uppercase tracking-wider ${textSubtle}`}>{section.tag}</div>
                    </div>
                    <ChevronDown className={`w-4 h-4 ${textMuted} transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <ul className="mt-1 mb-2 space-y-0.5">
                      {section.books.map(b => (
                        <li key={b.id}>
                          <button
                            onClick={() => openBook(b)}
                            className={`
                              w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm
                              ${book?.id === b.id ? `${accentBg} ${accent}` : `${hover} ${text}`}
                              transition group
                            `}
                          >
                            <span className="flex items-center gap-2">
                              {b.name}
                              {b.deutero && (
                                <span className={`text-[9px] uppercase tracking-wider ${dark ? 'text-amber-500/70' : 'text-amber-700/70'} font-bold`}>
                                  D
                                </span>
                              )}
                            </span>
                            <span className={`text-[10px] ${textSubtle}`}>{b.chapters}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}

            <div className={`mt-4 mx-3 p-3 rounded-lg ${bgSubtle} text-[11px] ${textMuted} leading-relaxed`}>
              <div className="font-bold mb-1 flex items-center gap-1.5">
                <Sparkles className={`w-3 h-3 ${accent}`} />
                <span>About this Bible</span>
              </div>
              <p>73 books in the Catholic canon. <span className="font-bold">D</span> marks deuterocanonical books not found in Protestant Bibles. Translation: New Revised Standard Version, Catholic Edition (NRSV-CE).</p>
            </div>
          </nav>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/40 z-10"
          />
        )}

        {/* ─── MAIN CONTENT ─── */}
        <main ref={readingPaneRef} className="flex-1 overflow-y-auto">

          {/* HOME VIEW */}
          {view === 'home' && (
            <div className="px-4 sm:px-8 py-8 sm:py-14 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${accentBg} ${accent} text-xs uppercase tracking-widest font-medium mb-6`}>
                  <Cross className="w-3 h-3" />
                  Sacred Scripture
                </div>
                <h1 className="font-serif text-4xl sm:text-6xl leading-tight mb-4">
                  The Catholic Bible
                </h1>
                <p className={`${textMuted} max-w-xl mx-auto leading-relaxed`}>
                  73 books. The full canon — Old and New Testament, including the deuterocanonical writings. Read the Word in the New Revised Standard Version, Catholic Edition.
                </p>
              </div>

              {/* Continue reading */}
              {history.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-3">
                    <History className={`w-4 h-4 ${textMuted}`} />
                    <h2 className="text-sm uppercase tracking-widest font-medium">Continue Reading</h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {history.slice(0, 4).map((h, i) => {
                      const b = ALL_BOOKS.find(x => x.id === h.bookId);
                      if (!b) return null;
                      return (
                        <button
                          key={i}
                          onClick={() => openChapter(b, h.chapter)}
                          className={`text-left p-3 rounded-lg border ${border} ${hover} transition group`}
                        >
                          <div className="text-xs uppercase tracking-wider opacity-60">Chapter {h.chapter}</div>
                          <div className="font-serif text-base mt-0.5">{b.name}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Featured passages */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className={`w-4 h-4 ${accent}`} />
                  <h2 className="text-sm uppercase tracking-widest font-medium">Beloved Passages</h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {FEATURED.map(f => {
                    const b = ALL_BOOKS.find(x => x.id === f.bookId);
                    return (
                      <button
                        key={f.ref}
                        onClick={() => b && openChapter(b, f.chapter)}
                        className={`
                          group relative overflow-hidden rounded-xl border ${border} p-5 text-left
                          ${dark ? 'bg-slate-900 hover:bg-slate-800' : 'bg-white hover:bg-stone-50'}
                          transition-all hover:-translate-y-0.5 hover:shadow-lg
                        `}
                      >
                        <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${
                          f.accent === 'amber' ? 'from-amber-400 to-orange-500' :
                          f.accent === 'emerald' ? 'from-emerald-400 to-teal-500' :
                          f.accent === 'violet' ? 'from-violet-400 to-purple-500' :
                          f.accent === 'sky' ? 'from-sky-400 to-blue-500' :
                          f.accent === 'rose' ? 'from-rose-400 to-red-500' :
                          'from-pink-400 to-fuchsia-500'
                        }`} />
                        <div className={`text-xs uppercase tracking-widest ${textSubtle} mb-1`}>{f.ref}</div>
                        <div className="font-serif text-lg leading-tight mb-1">{f.label}</div>
                        <div className={`text-xs ${textMuted}`}>{f.desc}</div>
                        <ArrowRight className={`w-4 h-4 ${textSubtle} mt-3 group-hover:${accent} group-hover:translate-x-1 transition`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={`mt-12 text-center text-xs ${textSubtle}`}>
                Tip: Use the search bar at the top to jump to any reference — try <span className={`${accent} font-mono`}>matt 5:3</span> or <span className={`${accent} font-mono`}>ps 23</span>
              </div>
            </div>
          )}

          {/* BOOK VIEW (chapter selector) */}
          {view === 'book' && book && (
            <div className="px-4 sm:px-8 py-8 max-w-4xl mx-auto">
              <button onClick={() => setView('home')} className={`flex items-center gap-1 text-xs ${textMuted} hover:${accent} mb-6 transition`}>
                <ChevronLeft className="w-3 h-3" />
                Home
              </button>

              <div className="mb-8">
                <div className={`text-xs uppercase tracking-widest ${accent} font-medium mb-2`}>{book.section}{book.deutero && ' · Deuterocanonical'}</div>
                <h1 className="font-serif text-4xl sm:text-5xl mb-3">{book.name}</h1>
                <p className={`${textMuted} max-w-2xl leading-relaxed`}>{book.intro}</p>
                <div className={`mt-3 text-sm ${textSubtle}`}>{book.chapters} {book.chapters === 1 ? 'chapter' : 'chapters'}</div>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {Array.from({ length: book.chapters }, (_, i) => i + 1).map(c => (
                  <button
                    key={c}
                    onClick={() => openChapter(book, c)}
                    className={`
                      aspect-square flex items-center justify-center rounded-lg border ${border}
                      font-serif text-base ${hover}
                      ${dark ? 'bg-slate-900' : 'bg-white'}
                      hover:${accent} hover:border-amber-500/50 transition
                    `}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CHAPTER VIEW */}
          {view === 'chapter' && book && (
            <div className="px-4 sm:px-8 py-8 max-w-3xl mx-auto">
              {loading && (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className={`w-6 h-6 ${accent} animate-spin`} />
                </div>
              )}

              {error && (
                <div className={`p-6 rounded-lg border ${border} ${bgSubtle} text-center`}>
                  <div className={`${textMuted} mb-3`}>{error}</div>
                  <button
                    onClick={() => fetchChapter(book, chapter)}
                    className={`text-sm ${accent} underline`}
                  >
                    Try again
                  </button>
                </div>
              )}

              {verses && !loading && (
                <>
                  {/* Chapter header */}
                  <div className="text-center mb-10">
                    <div className={`text-xs uppercase tracking-widest ${textSubtle} mb-1`}>{book.name}</div>
                    <div className={`font-serif text-5xl ${accent}`}>{chapter}</div>
                    <div className={`mt-3 mx-auto w-12 h-px ${dark ? 'bg-amber-400/30' : 'bg-amber-700/30'}`} />
                  </div>

                  {/* Verses */}
                  <div
                    className="font-serif leading-loose"
                    style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
                  >
                    {verses.map((v, i) => {
                      const cleanText = stripHtml(v.text);
                      const bookmarked = isBookmarked(v);
                      const isHighlight = highlightVerse === v.verse;
                      return (
                        <span
                          key={v.verse}
                          id={`v-${v.verse}`}
                          className={`group relative ${isHighlight ? (dark ? 'bg-amber-500/20' : 'bg-amber-100') + ' rounded px-1 -mx-1' : ''}`}
                        >
                          {i === 0 ? (
                            <span className={`float-left font-serif text-7xl leading-none mr-2 mt-1 ${accent}`} style={{ fontSize: `${fontSize * 3.5}px` }}>
                              {cleanText.charAt(0)}
                            </span>
                          ) : (
                            <sup className={`text-[0.65em] mr-1 ml-0.5 font-sans font-bold ${accent} cursor-pointer hover:underline`}
                                  onClick={() => copyVerse(v)}>
                              {v.verse}
                            </sup>
                          )}
                          {i === 0 ? (
                            <>
                              <sup className={`text-[0.65em] mr-1 font-sans font-bold ${accent} cursor-pointer hover:underline`} onClick={() => copyVerse(v)}>{v.verse}</sup>
                              {cleanText.slice(1)}
                            </>
                          ) : cleanText}
                          {' '}
                          <button
                            onClick={() => toggleBookmark(v)}
                            className={`
                              inline-flex items-center align-middle ml-0.5 opacity-0 group-hover:opacity-100 transition
                              ${bookmarked ? 'opacity-100' : ''}
                            `}
                            aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
                          >
                            {bookmarked ? (
                              <BookmarkCheck className={`w-3.5 h-3.5 ${accent}`} />
                            ) : (
                              <Bookmark className={`w-3.5 h-3.5 ${textMuted}`} />
                            )}
                          </button>
                        </span>
                      );
                    })}
                  </div>

                  {copiedRef && (
                    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full ${dark ? 'bg-slate-700' : 'bg-stone-800 text-white'} text-xs flex items-center gap-2 shadow-lg z-40`}>
                      <Check className="w-3 h-3" />
                      Copied {copiedRef}
                    </div>
                  )}

                  {/* Chapter nav */}
                  <div className={`mt-12 pt-6 border-t ${border} flex items-center justify-between`}>
                    <button
                      onClick={() => navChapter(-1)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${hover} transition`}
                      disabled={book.id === 1 && chapter === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="text-sm">Previous</span>
                    </button>

                    <button
                      onClick={() => setView('book')}
                      className={`text-xs uppercase tracking-widest ${textMuted} hover:${accent} transition`}
                    >
                      All Chapters
                    </button>

                    <button
                      onClick={() => navChapter(1)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${hover} transition`}
                      disabled={book.id === 73 && chapter === 22}
                    >
                      <span className="text-sm">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* BOOKMARKS VIEW */}
          {view === 'bookmarks' && (
            <div className="px-4 sm:px-8 py-8 max-w-3xl mx-auto">
              <button onClick={() => setView('home')} className={`flex items-center gap-1 text-xs ${textMuted} hover:${accent} mb-6 transition`}>
                <ChevronLeft className="w-3 h-3" />
                Home
              </button>

              <h1 className="font-serif text-4xl mb-2">Bookmarks</h1>
              <p className={`${textMuted} mb-8`}>{bookmarks.length} {bookmarks.length === 1 ? 'verse' : 'verses'} saved</p>

              {bookmarks.length === 0 ? (
                <div className={`text-center py-16 rounded-lg border ${border} ${bgSubtle}`}>
                  <Bookmark className={`w-8 h-8 ${textSubtle} mx-auto mb-3`} />
                  <p className={textMuted}>No bookmarks yet.</p>
                  <p className={`${textSubtle} text-sm mt-1`}>Hover any verse and click the bookmark icon.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookmarks.map(b => {
                    const bookData = ALL_BOOKS.find(x => x.id === b.bookId);
                    return (
                      <div
                        key={b.ref}
                        className={`p-4 rounded-lg border ${border} ${dark ? 'bg-slate-900' : 'bg-white'} group`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <button
                            onClick={() => bookData && openChapter(bookData, b.chapter, b.verse)}
                            className={`text-xs uppercase tracking-widest font-medium ${accent} hover:underline`}
                          >
                            {b.ref}
                          </button>
                          <button
                            onClick={() => {
                              const next = bookmarks.filter(x => x.ref !== b.ref);
                              setBookmarks(next);
                              persistBookmarks(next);
                            }}
                            className={`opacity-0 group-hover:opacity-100 ${textMuted} hover:text-red-500 transition`}
                            aria-label="Remove"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="font-serif leading-relaxed" style={{ fontSize: '15px' }}>
                          {stripHtml(b.text)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ═══ FOOTER ═══ */}
      <footer className={`border-t ${border} py-4 px-4 text-center text-[11px] ${textSubtle}`}>
        New Revised Standard Version, Catholic Edition · Verses fetched from <span className="font-mono">bolls.life</span>
      </footer>
    </div>
  );
}

// Strip HTML tags from verse text (bolls.life sometimes includes <S>, <i> tags)
function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}
