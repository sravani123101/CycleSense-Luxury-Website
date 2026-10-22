import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, HeartPulse, RotateCcw, ShieldCheck } from "lucide-react";

const STORAGE_KEY = "cyclesense-cycle-tracker-v1";

function parseLocalDate(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDate(date) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function dateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + amount);
  return next;
}

function differenceInDays(later, earlier) {
  return Math.floor((later.getTime() - earlier.getTime()) / 86400000);
}

function getCyclePhase(cycleDay, periodLength, cycleLength) {
  if (cycleDay <= periodLength) {
    return {
      name: "Menstrual phase",
      detail: "A time to slow down, rest when you can, and notice how you feel.",
      progress: Math.min(100, (cycleDay / periodLength) * 100),
    };
  }

  const ovulationDay = Math.max(periodLength + 1, cycleLength - 14);
  if (cycleDay >= ovulationDay - 1 && cycleDay <= ovulationDay + 1) {
    return {
      name: "Estimated ovulatory window",
      detail: "Ovulation timing varies. This is only a calendar-based estimate, not a fertility guarantee.",
      progress: Math.min(100, (cycleDay / cycleLength) * 100),
    };
  }

  if (cycleDay < ovulationDay - 1) {
    return {
      name: "Follicular phase",
      detail: "Your body is moving through the first part of the cycle. Your own patterns may differ.",
      progress: Math.min(100, (cycleDay / cycleLength) * 100),
    };
  }

  return {
    name: "Luteal phase",
    detail: "The second part of the cycle. Keep notes on energy, mood, and symptoms if helpful.",
    progress: Math.min(100, (cycleDay / cycleLength) * 100),
  };
}

function loadSavedData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (error) {
    console.warn("CycleSense could not read saved cycle data.", error);
  }
  return null;
}

export default function CycleTracker() {
  const todayValue = dateInputValue(new Date());
  const saved = useMemo(() => loadSavedData(), []);
  const [periodStart, setPeriodStart] = useState(saved?.periodStart || "");
  const [cycleLength, setCycleLength] = useState(String(saved?.cycleLength || 28));
  const [periodLength, setPeriodLength] = useState(String(saved?.periodLength || 5));
  const [savedMessage, setSavedMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hasSaved, setHasSaved] = useState(Boolean(saved?.periodStart));

  useEffect(() => {
    if (!saved?.periodStart) return;
    setSavedMessage("Your cycle details were restored from this browser.");
  }, [saved]);

  const cycleInfo = useMemo(() => {
    if (!hasSaved || !periodStart) return null;
    const start = parseLocalDate(periodStart);
    if (!start) return null;
    const length = Number(cycleLength);
    const periodDays = Number(periodLength);
    if (!Number.isFinite(length) || !Number.isFinite(periodDays)) return null;

    const today = parseLocalDate(todayValue);
    const elapsedDays = differenceInDays(today, start);
    if (elapsedDays < 0) return null;
    const cycleDay = (elapsedDays % length) + 1;
    const cyclesElapsed = Math.floor(elapsedDays / length);
    const currentCycleStart = addDays(start, cyclesElapsed * length);
    const nextPeriod = addDays(currentCycleStart, length);
    const phase = getCyclePhase(cycleDay, periodDays, length);
    const estimatedOvulation = addDays(currentCycleStart, Math.max(0, length - 14 - 1));
    const fertileStart = addDays(estimatedOvulation, -5);
    const fertileEnd = addDays(estimatedOvulation, 1);
    return { cycleDay, currentCycleStart, nextPeriod, phase, fertileStart, fertileEnd, length };
  }, [hasSaved, periodStart, cycleLength, periodLength, todayValue]);

  function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setSavedMessage("");

    const start = parseLocalDate(periodStart);
    const today = parseLocalDate(todayValue);
    const length = Number(cycleLength);
    const periodDays = Number(periodLength);

    if (!start) {
      setErrorMessage("Please choose the first day of your most recent period.");
      return;
    }
    if (start.getTime() > today.getTime()) {
      setErrorMessage("The period start date cannot be in the future.");
      return;
    }
    if (!Number.isInteger(length) || length < 21 || length > 35) {
      setErrorMessage("Enter a cycle length between 21 and 35 days.");
      return;
    }
    if (!Number.isInteger(periodDays) || periodDays < 2 || periodDays > 10) {
      setErrorMessage("Enter a period duration between 2 and 10 days.");
      return;
    }
    if (periodDays >= length) {
      setErrorMessage("Period duration must be shorter than cycle length.");
      return;
    }

    const data = { periodStart, cycleLength: length, periodLength: periodDays };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setHasSaved(true);
      setSavedMessage("Your cycle details are saved on this browser.");
    } catch (error) {
      setHasSaved(true);
      setSavedMessage("Your results are shown, but this browser could not save them. Please keep a private note of your details.");
    }
  }

  function clearData() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("CycleSense could not clear saved cycle data.", error);
    }
    setPeriodStart("");
    setCycleLength("28");
    setPeriodLength("5");
    setHasSaved(false);
    setSavedMessage("");
    setErrorMessage("");
  }

  return (
    <section className="cycle-tracker section-pad" id="cycle-tracker">
      <div className="cycle-tracker-heading">
        <p className="eyebrow"><span /> YOUR PERSONAL RHYTHM</p>
        <h2>A little clarity,<br /><em>one cycle at a time.</em></h2>
        <p className="body-copy">Add a few details to see a gentle calendar-based estimate of your current cycle. Your body is unique, and your dates can vary.</p>
      </div>

      <div className="tracker-layout">
        <form className="tracker-form" onSubmit={handleSubmit}>
          <div className="tracker-form-title">
            <span className="tracker-icon"><CalendarDays size={21} strokeWidth={1.4} /></span>
            <div>
              <p className="tracker-kicker">YOUR DETAILS</p>
              <h3>Personalize your tracker</h3>
            </div>
          </div>

          <label className="tracker-label" htmlFor="period-start">First day of your most recent period</label>
          <input id="period-start" className="tracker-input" type="date" max={todayValue} value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} required />

          <div className="tracker-two-fields">
            <div>
              <label className="tracker-label" htmlFor="cycle-length">Cycle length</label>
              <select id="cycle-length" className="tracker-input" value={cycleLength} onChange={(event) => setCycleLength(event.target.value)}>
                {Array.from({ length: 15 }, (_, i) => i + 21).map((days) => <option key={days} value={days}>{days} days</option>)}
              </select>
            </div>
            <div>
              <label className="tracker-label" htmlFor="period-length">Period duration</label>
              <select id="period-length" className="tracker-input" value={periodLength} onChange={(event) => setPeriodLength(event.target.value)}>
                {Array.from({ length: 9 }, (_, i) => i + 2).map((days) => <option key={days} value={days}>{days} days</option>)}
              </select>
            </div>
          </div>

          {errorMessage && <p className="tracker-alert tracker-error" role="alert">{errorMessage}</p>}
          {savedMessage && <p className="tracker-alert tracker-success" role="status">{savedMessage}</p>}

          <div className="tracker-actions">
            <button className="button button-primary tracker-submit" type="submit">Update my cycle <HeartPulse size={16} /></button>
            {hasSaved && <button className="tracker-reset" type="button" onClick={clearData}><RotateCcw size={14} /> Clear details</button>}
          </div>

          <p className="tracker-privacy"><ShieldCheck size={15} /> Your details stay in this browser on this device. This demo does not upload them to a server.</p>
        </form>

        <div className="tracker-results" aria-live="polite">
          {cycleInfo ? (
            <>
              <div className="tracker-results-top">
                <p className="tracker-kicker">YOUR CYCLE AT A GLANCE</p>
                <span className="tracker-date">{formatDate(parseLocalDate(todayValue))}</span>
              </div>
              <div className="cycle-day-row">
                <div><span className="cycle-day-label">TODAY IS</span><div className="cycle-day-number">Day <strong>{cycleInfo.cycleDay}</strong></div></div>
                <div className="cycle-orbit"><span>{cycleInfo.cycleDay}</span><small>of {cycleInfo.length}</small></div>
              </div>
              <div className="cycle-progress"><span style={{ width: `${(cycleInfo.cycleDay / cycleInfo.length) * 100}%` }} /></div>
              <div className="phase-result">
                <span className="phase-dot" />
                <div><p className="tracker-kicker">ESTIMATED PHASE</p><h3>{cycleInfo.phase.name}</h3><p>{cycleInfo.phase.detail}</p></div>
              </div>
              <div className="tracker-date-grid">
                <div className="tracker-date-card"><span>NEXT PERIOD (EST.)</span><strong>{formatDate(cycleInfo.nextPeriod)}</strong><small>About {Math.max(0, differenceInDays(cycleInfo.nextPeriod, parseLocalDate(todayValue)))} days from today</small></div>
                <div className="tracker-date-card"><span>FERTILE WINDOW (EST.)</span><strong>{formatDate(cycleInfo.fertileStart)} – {formatDate(cycleInfo.fertileEnd)}</strong><small>Calendar estimate only; not contraception guidance</small></div>
              </div>
            </>
          ) : (
            <div className="tracker-empty">
              <span className="tracker-empty-flower"><CalendarDays size={30} strokeWidth={1.1} /></span>
              <p className="tracker-kicker">YOUR SPACE, YOUR PACE</p>
              <h3>Your cycle overview<br /><em>will appear here.</em></h3>
              <p>Enter the first day of your most recent period and select your usual cycle length. We’ll calculate a simple estimate for you.</p>
            </div>
          )}
        </div>
      </div>
      <p className="tracker-disclaimer">CycleSense AI is a wellness tool, not a medical device. Cycle length, ovulation, and fertile-window estimates can be inaccurate, especially with irregular cycles. Do not use these estimates to prevent pregnancy or diagnose a health condition.</p>
    </section>
  );
}
