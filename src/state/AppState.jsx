import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loadClasses, getDemoSettings, saveDemoSettings, DEFAULT_DEMO } from '../services/mockLoader.js';
import { KEYS, readJSON, writeJSON } from '../services/storage.js';
import { sanitizePlan, validatePlan } from '../rules/planValidation.js';
import { calculateLine, summarizePlan } from '../rules/pricing.js';

// One shared source of truth for listings, details, the plan and summaries.
const AppContext = createContext(null);

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside <AppProvider>');
  return value;
}

function makeReference() {
  return `MM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function AppProvider({ children }) {
  // --- timetable loading (asynchronous mock loader) ---
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const [classes, setClasses] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);

  // --- persisted state (restored from local storage on first render) ---
  const [plan, setPlan] = useState(() => sanitizePlan(readJSON(KEYS.plan, [])));
  const [prefs, setPrefs] = useState(() => ({ sort: 'soonest', level: '', ...readJSON(KEYS.prefs, {}) }));
  const [lastOrder, setLastOrder] = useState(() => readJSON(KEYS.lastOrder, null));
  const [demo, setDemo] = useState(() => getDemoSettings());

  // --- in-memory only: the checkout form is never written to storage ---
  const [draft, setDraft] = useState(null);

  // "now" ticks so booking cut-offs update while the page stays open.
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError('');
    loadClasses()
      .then((data) => {
        if (cancelled) return;
        setClasses(data);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    writeJSON(KEYS.plan, plan);
  }, [plan]);

  useEffect(() => {
    writeJSON(KEYS.prefs, prefs);
  }, [prefs]);

  // --- derived values ---
  const classesById = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes]);

  const planLines = useMemo(
    () =>
      plan
        .map((item) => ({ ...item, cls: classesById.get(item.classId) }))
        .filter((line) => line.cls),
    [plan, classesById],
  );

  const summary = useMemo(() => summarizePlan(planLines), [planLines]);

  const planIssues = useMemo(
    () =>
      status === 'ready'
        ? validatePlan(plan, classesById, { now, participantLevel: prefs.level || null })
        : [],
    [status, plan, classesById, now, prefs.level],
  );

  const planSeatCount = plan.reduce((total, item) => total + item.seats, 0);

  // --- plan actions (functional updates, no mutation) ---
  const setSeats = useCallback((classId, seats) => {
    setPlan((prev) =>
      prev.some((item) => item.classId === classId)
        ? prev.map((item) => (item.classId === classId ? { ...item, seats } : item))
        : [...prev, { classId, seats }],
    );
  }, []);

  const removeFromPlan = useCallback((classId) => {
    setPlan((prev) => prev.filter((item) => item.classId !== classId));
  }, []);

  // --- loading controls ---
  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const updateDemo = useCallback(
    (patch) => {
      const next = { ...demo, ...patch };
      saveDemoSettings(next);
      setDemo(next);
    },
    [demo],
  );

  // Retry clears the simulated failure first, so the second attempt really works.
  const retry = useCallback(() => {
    const next = { ...demo, failLoad: false };
    saveDemoSettings(next);
    setDemo(next);
    setReloadKey((key) => key + 1);
  }, [demo]);

  const simulateAvailabilityChange = useCallback(() => {
    if (plan.length === 0) {
      return { changed: false, message: 'Add a class to your plan first, then try again.' };
    }
    const remainingOverrides = { ...demo.remainingOverrides };
    plan.forEach((item, index) => {
      // First class becomes full; the others lose one seat below what was chosen.
      remainingOverrides[item.classId] = index === 0 ? 0 : Math.max(0, item.seats - 1);
    });
    const next = { ...demo, remainingOverrides };
    saveDemoSettings(next);
    setDemo(next);
    setReloadKey((key) => key + 1);
    return { changed: true, message: 'Availability changed. Open your plan to see the conflicts.' };
  }, [demo, plan]);

  const resetDemo = useCallback(() => {
    saveDemoSettings(DEFAULT_DEMO);
    setDemo({ ...DEFAULT_DEMO, remainingOverrides: {} });
    setReloadKey((key) => key + 1);
  }, []);

  // --- finishing the journey (simulated) ---
  const completeBooking = useCallback(() => {
    const lines = planLines;
    const order = {
      ref: makeReference(),
      placedAt: new Date().toISOString(),
      simulated: true,
      items: lines.map(({ cls, seats }) => ({
        classId: cls.id,
        title: cls.title,
        startsAt: cls.startsAt.toISOString(),
        seats,
        ...calculateLine(cls.pricePKR, seats),
      })),
      summary,
    };

    // Remember the seats this browser booked so availability stays believable after refresh.
    const booked = readJSON(KEYS.booked, {});
    lines.forEach(({ cls, seats }) => {
      booked[cls.id] = (booked[cls.id] ?? 0) + seats;
    });
    writeJSON(KEYS.booked, booked);

    const remainingOverrides = { ...demo.remainingOverrides };
    lines.forEach(({ cls, seats }) => {
      if (cls.id in remainingOverrides) {
        remainingOverrides[cls.id] = Math.max(0, remainingOverrides[cls.id] - seats);
      }
    });
    const nextDemo = { ...demo, remainingOverrides };
    saveDemoSettings(nextDemo);
    setDemo(nextDemo);

    setClasses((prev) =>
      prev.map((cls) => {
        const line = lines.find((l) => l.cls.id === cls.id);
        return line ? { ...cls, remaining: Math.max(0, cls.remaining - line.seats) } : cls;
      }),
    );

    setLastOrder(order);
    writeJSON(KEYS.lastOrder, order);
    setPlan([]);
    setDraft(null);
    return order;
  }, [planLines, summary, demo]);

  const value = {
    status,
    error,
    classes,
    classesById,
    plan,
    planLines,
    planIssues,
    planSeatCount,
    summary,
    prefs,
    setPrefs,
    lastOrder,
    demo,
    draft,
    setDraft,
    now,
    setSeats,
    removeFromPlan,
    reload,
    retry,
    updateDemo,
    simulateAvailabilityChange,
    resetDemo,
    completeBooking,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
