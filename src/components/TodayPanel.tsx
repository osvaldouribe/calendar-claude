'use client';

import React, { useState, useMemo } from 'react';
import type { TodayInfo, UserBirthInfo, Element } from '@/lib/cosmic-data';
import { ELEMENT_COLORS, getTodayInfo, getPersonalNote } from '@/lib/cosmic-data';
import type { CalendarEvent, GoalEvent } from './CircularCalendar';

// ── entry type registry — add new types here only ────────────────────────────
const ENTRY_TYPES = [
  { key: 'reminder' as const, label: 'Reminder' },
  { key: 'goal'     as const, label: 'Goal'     },
] satisfies { key: string; label: string }[];

type EntryType = typeof ENTRY_TYPES[number]['key'];

// ── goal energy alignment ────────────────────────────────────────────────────
const GOAL_ENERGY: Record<string, string> = {
  fire:  'initiation — act before you feel ready',
  earth: 'discipline — small consistent steps compound',
  air:   'clarity — write it down, refine the plan',
  water: 'intention — reconnect with why it matters',
};

function daysUntil(month: number, day: number, year: number): number {
  const target = new Date(year, month - 1, day);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// ── props ─────────────────────────────────────────────────────────────────────
interface TodayPanelProps {
  today: Date;
  todayInfo: TodayInfo;
  selectedEvent: CalendarEvent | null;
  selectedGoal: GoalEvent | null;
  isLoggedIn: boolean;
  goals?: GoalEvent[];
  onAddDate?: (data: { label: string; month: number; day: number; year: number | null }) => Promise<void>;
  onAddGoal?: (data: { title: string; description: string | null; targetMonth: number; targetDay: number; targetYear: number }) => Promise<void>;
  onClearSelection?: () => void;
  userBirthInfo?: UserBirthInfo | null;
}

const INTER = "'Inter', system-ui, sans-serif";
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const GOAL_COLOR = '#D4A843';

const S = { xs: '8px', sm: '16px', md: '24px', lg: '32px' } as const;

const lbl: React.CSSProperties = {
  fontFamily: INTER, fontSize: '11px', color: 'var(--ink-light)',
};

const HR = <div style={{ height: '1px', background: 'var(--border)', margin: `${S.md} 0` }} />;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: `${S.xs} 0` }}>
      <span style={lbl}>{label}</span>
      <span style={{ fontFamily: INTER, fontSize: '13px', color: 'var(--ink)' }}>{value}</span>
    </div>
  );
}

function Badge({ element }: { element: string }) {
  const c = ELEMENT_COLORS[element as keyof typeof ELEMENT_COLORS];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 9px', borderRadius: '99px',
      backgroundColor: c.bg, color: c.text,
      fontFamily: INTER, fontSize: '11px',
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: c.dot, flexShrink: 0 }} />
      {element.charAt(0).toUpperCase() + element.slice(1)}
    </span>
  );
}

function DiamondIcon({ size = 9, color = GOAL_COLOR }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" style={{ flexShrink: 0 }}>
      <rect x="1" y="1" width="8" height="8" fill={color} transform="rotate(45 5 5)" rx="0.5" />
    </svg>
  );
}

function CosmicSnapshot({ month, day, birthElement }: {
  month: number; day: number; birthElement?: Element | null;
}) {
  const info = useMemo(() => {
    const now = new Date();
    const thisYear = new Date(now.getFullYear(), month - 1, day);
    const date = thisYear >= now ? thisYear : new Date(now.getFullYear() + 1, month - 1, day);
    return getTodayInfo(date);
  }, [month, day]);

  const personalNote = useMemo(
    () => birthElement ? getPersonalNote(birthElement, info.element) : null,
    [birthElement, info.element]
  );

  return (
    <div style={{
      background: 'var(--bg-cream)', borderRadius: '8px',
      padding: '12px', border: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '16px', lineHeight: 1 }}>{info.zodiac.symbol}</span>
          <span style={{ fontFamily: INTER, fontSize: '13px', fontWeight: 500, color: 'var(--ink)' }}>
            {info.zodiac.name}
          </span>
        </div>
        <Badge element={info.element} />
      </div>
      <div style={{ borderTop: '1px solid var(--border)' }}>
        <Row label="Planet" value={info.planet} />
        <Row label="Tarot"  value={info.tarot} />
        <Row label="Season" value={info.season} />
      </div>
      <p style={{
        fontFamily: INTER, fontSize: '11px', color: 'var(--ink-mid)',
        lineHeight: 1.55, margin: '8px 0 0', fontStyle: 'italic',
      }}>
        {info.energyDescription}
      </p>
      {personalNote && (
        <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '8px' }}>
          <p style={{ fontFamily: INTER, fontSize: '11px', color: 'var(--ink-light)', lineHeight: 1.55, margin: 0 }}>
            {personalNote}
          </p>
        </div>
      )}
    </div>
  );
}

// ── shared input style ────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', fontSize: '13px', border: '1px solid var(--border)',
  borderRadius: '5px', padding: `${S.xs} 10px`, background: 'transparent',
  color: 'var(--ink)', fontFamily: INTER, outline: 'none', boxSizing: 'border-box',
};
const selectStyle: React.CSSProperties = {
  flex: 1, fontSize: '13px', border: '1px solid var(--border)',
  borderRadius: '5px', padding: `${S.xs} 8px`, background: 'transparent',
  color: 'var(--ink)', fontFamily: INTER, outline: 'none', appearance: 'none' as const,
};

// ── main component ────────────────────────────────────────────────────────────
export default function TodayPanel({
  today, todayInfo, selectedEvent, selectedGoal,
  isLoggedIn, goals = [], onAddDate, onAddGoal, onClearSelection, userBirthInfo,
}: TodayPanelProps) {
  const [entryType, setEntryType]   = useState<EntryType | null>(null);
  const [saving, setSaving]         = useState(false);

  const [reminderForm, setReminderForm] = useState({
    label: '', month: today.getMonth() + 1, day: today.getDate(), year: '',
  });
  const [goalForm, setGoalForm] = useState({
    title: '', description: '',
    month: today.getMonth() + 1, day: today.getDate(), year: String(today.getFullYear()),
  });

  const resetForms = () => {
    setReminderForm({ label: '', month: today.getMonth() + 1, day: today.getDate(), year: '' });
    setGoalForm({ title: '', description: '', month: today.getMonth() + 1, day: today.getDate(), year: String(today.getFullYear()) });
    setEntryType(null);
    setSaving(false);
  };

  const submitReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderForm.label) return;
    setSaving(true);
    await onAddDate?.({
      label: reminderForm.label,
      month: reminderForm.month,
      day:   reminderForm.day,
      year:  reminderForm.year ? parseInt(reminderForm.year) : null,
    });
    resetForms();
  };

  const submitGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalForm.title || !goalForm.year) return;
    setSaving(true);
    await onAddGoal?.({
      title:       goalForm.title,
      description: goalForm.description || null,
      targetMonth: goalForm.month,
      targetDay:   goalForm.day,
      targetYear:  parseInt(goalForm.year),
    });
    resetForms();
  };

  const { zodiac, element, planet, tarot, energyDescription, season, nextFullMoon } = todayInfo;
  const currentYearGoals = goals
    .filter(g => g.targetYear === today.getFullYear())
    .sort((a, b) => (a.targetMonth * 31 + a.targetDay) - (b.targetMonth * 31 + b.targetDay));

  // ── selected goal view ────────────────────────────────────────────────────
  if (selectedGoal) {
    const deadline = new Date(selectedGoal.targetYear, selectedGoal.targetMonth - 1, selectedGoal.targetDay);
    const days = daysUntil(selectedGoal.targetMonth, selectedGoal.targetDay, selectedGoal.targetYear);
    const deadlineStr = deadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const daysLabel = days > 0 ? `${days} days remaining` : days === 0 ? 'Due today' : 'Deadline passed';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: S.md }}>
        <button onClick={onClearSelection} style={{
          fontFamily: INTER, fontSize: '13px', color: 'var(--ink-light)',
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 0, textAlign: 'left', marginBottom: S.md,
        }}>
          ← Today
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: S.sm }}>
          <DiamondIcon />
          <span style={lbl}>Goal</span>
        </div>
        <p style={{ ...lbl, marginBottom: S.xs }}>{deadlineStr}</p>
        <h2 style={{
          fontFamily: INTER, fontSize: '18px', fontWeight: 500,
          color: 'var(--ink)', lineHeight: 1.3, margin: `0 0 ${S.xs}`,
        }}>
          {selectedGoal.title}
        </h2>
        <p style={{
          fontFamily: INTER, fontSize: '12px',
          color: days <= 30 && days >= 0 ? GOAL_COLOR : 'var(--ink-light)',
          margin: `0 0 ${S.md}`,
        }}>
          {daysLabel}
        </p>
        <CosmicSnapshot
          month={selectedGoal.targetMonth}
          day={selectedGoal.targetDay}
          birthElement={userBirthInfo?.westernSign.element ?? null}
        />
        {HR}
        <p style={{ ...lbl, marginBottom: S.xs }}>Energy today</p>
        <p style={{
          fontFamily: INTER, fontSize: '13px', color: 'var(--ink-mid)',
          lineHeight: 1.6, fontStyle: 'italic', margin: 0,
        }}>
          {element.charAt(0).toUpperCase() + element.slice(1)} energy favors {GOAL_ENERGY[element] ?? 'focus and intention'}. Use it.
        </p>
        {selectedGoal.description && (
          <>{HR}
          <p style={{ fontFamily: INTER, fontSize: '13px', color: 'var(--ink-mid)', lineHeight: 1.6 }}>
            {selectedGoal.description}
          </p></>
        )}
        <div style={{ marginTop: 'auto', paddingTop: S.lg }}><Attribution /></div>
      </div>
    );
  }

  // ── selected event view ───────────────────────────────────────────────────
  if (selectedEvent) {
    const evDate = new Date(selectedEvent.date);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: S.md }}>
        <button onClick={onClearSelection} style={{
          fontFamily: INTER, fontSize: '13px', color: 'var(--ink-light)',
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 0, textAlign: 'left', marginBottom: S.md,
        }}>
          ← Today
        </button>
        <div style={{ width: '24px', height: '2px', borderRadius: '1px',
          backgroundColor: selectedEvent.color ?? '#9C9792', marginBottom: S.sm }} />
        <p style={{ ...lbl, marginBottom: S.xs }}>
          {evDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
        </p>
        <h2 style={{ fontFamily: INTER, fontSize: '18px', fontWeight: 500,
          color: 'var(--ink)', lineHeight: 1.3, margin: `0 0 ${S.md}` }}>
          {selectedEvent.title}
        </h2>
        <CosmicSnapshot
          month={evDate.getMonth() + 1}
          day={evDate.getDate()}
          birthElement={userBirthInfo?.westernSign.element ?? null}
        />
        {selectedEvent.description && (
          <>{HR}
          <p style={{ fontFamily: INTER, fontSize: '13px', color: 'var(--ink-mid)', lineHeight: 1.6 }}>
            {selectedEvent.description}
          </p></>
        )}
        <div style={{ marginTop: 'auto', paddingTop: S.lg }}><Attribution /></div>
      </div>
    );
  }

  // ── today view ────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: S.md }}>

      {/* Date header */}
      <p style={{ ...lbl, marginBottom: S.xs }}>{season}</p>
      <h1 style={{ fontFamily: INTER, fontSize: '24px', fontWeight: 300,
        color: 'var(--ink)', lineHeight: 1.1, margin: 0 }}>
        {today.getDate()}
        <span style={{ color: 'var(--ink-light)', margin: '0 6px' }}>·</span>
        {today.toLocaleString('default', { month: 'long' })}
      </h1>
      <p style={{ ...lbl, marginTop: S.xs, marginBottom: 0 }}>
        {today.toLocaleString('default', { weekday: 'long' })}, {today.getFullYear()}
      </p>

      {HR}

      {/* Zodiac */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.sm }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: S.xs }}>
          <span style={{ fontSize: '20px', lineHeight: 1 }}>{zodiac.symbol}</span>
          <span style={{ fontFamily: INTER, fontSize: '15px', fontWeight: 500, color: 'var(--ink)' }}>
            {zodiac.name}
          </span>
        </div>
        <Badge element={element} />
      </div>

      <div style={{ borderTop: '1px solid var(--border)' }}>
        <Row label="Planet" value={planet} />
        <Row label="Tarot"  value={tarot} />
      </div>

      {HR}

      <p style={{ fontFamily: INTER, fontSize: '13px', color: 'var(--ink-mid)', lineHeight: 1.6, margin: 0 }}>
        {energyDescription}
      </p>

      {HR}

      {/* Personal season message */}
      {userBirthInfo && (
        <>
          <p style={{ ...lbl, marginBottom: S.sm }}>Your season</p>
          <p style={{ fontFamily: INTER, fontSize: '13px', fontStyle: 'italic',
            color: 'var(--ink-mid)', lineHeight: 1.6, margin: 0 }}>
            {userBirthInfo.personalNote}
          </p>
          {HR}
        </>
      )}

      {/* Full Moon */}
      <p style={{ ...lbl, marginBottom: S.sm }}>Next full moon</p>
      <div style={{ display: 'flex', gap: S.xs, alignItems: 'flex-start' }}>
        <span style={{ fontSize: '14px', color: 'var(--ink-light)', lineHeight: 1, marginTop: '2px' }}>○</span>
        <div>
          <p style={{ fontFamily: INTER, fontSize: '14px', fontWeight: 500,
            color: 'var(--ink)', margin: `0 0 ${S.xs}` }}>
            {nextFullMoon.name}
          </p>
          <p style={{ ...lbl, marginBottom: S.xs }}>
            {new Date(nextFullMoon.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p style={{ fontFamily: INTER, fontSize: '12px', color: 'var(--ink-light)', lineHeight: 1.5, margin: 0 }}>
            {nextFullMoon.description}
          </p>
        </div>
      </div>

      {/* Goals this year */}
      {isLoggedIn && currentYearGoals.length > 0 && (
        <>
          {HR}
          <p style={{ ...lbl, marginBottom: S.xs }}>
            Goals · {today.getFullYear()}
          </p>
          <p style={{
            fontFamily: INTER, fontSize: '12px', fontStyle: 'italic',
            color: 'var(--ink-light)', lineHeight: 1.5, margin: `0 0 ${S.sm}`,
          }}>
            {element.charAt(0).toUpperCase() + element.slice(1)} energy favors {GOAL_ENERGY[element] ?? 'focus and intention'}.
          </p>
          {currentYearGoals.map(goal => {
            const days = daysUntil(goal.targetMonth, goal.targetDay, goal.targetYear);
            const urgent = days >= 0 && days <= 30;
            return (
              <div key={goal.id} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: `6px 0`,
                borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <DiamondIcon size={7} color={urgent ? GOAL_COLOR : 'var(--ink-light)'} />
                  <span style={{ fontFamily: INTER, fontSize: '13px', color: 'var(--ink)' }}>
                    {goal.title}
                  </span>
                </div>
                <span style={{
                  fontFamily: INTER, fontSize: '11px',
                  color: urgent ? GOAL_COLOR : 'var(--ink-light)',
                  flexShrink: 0, marginLeft: '8px',
                }}>
                  {days > 0 ? `${days}d` : days === 0 ? 'today' : 'past'}
                </span>
              </div>
            );
          })}
        </>
      )}

      {/* Unified entry */}
      {isLoggedIn && (
        <div style={{ marginTop: S.md }}>
          {entryType === null ? (
            <button onClick={() => setEntryType('reminder')} style={{
              width: '100%', background: 'none', border: '1px solid var(--border)',
              borderRadius: '6px', padding: '10px', cursor: 'pointer',
              fontFamily: INTER, fontSize: '13px', color: 'var(--ink-light)',
            }}>
              +
            </button>
          ) : (
            <div>
              {/* Editorial type picker */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: S.sm }}>
                {ENTRY_TYPES.map(({ key, label }, i) => (
                  <React.Fragment key={key}>
                    {i > 0 && (
                      <span style={{ fontFamily: INTER, fontSize: '12px', color: 'var(--ink-light)' }}>·</span>
                    )}
                    <button
                      onClick={() => setEntryType(key)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontFamily: INTER, fontSize: '12px', padding: 0,
                        color: entryType === key ? 'var(--ink)' : 'var(--ink-light)',
                        fontWeight: entryType === key ? 500 : 400,
                      }}
                    >
                      {label}
                    </button>
                  </React.Fragment>
                ))}
              </div>

              {/* Reminder form */}
              {entryType === 'reminder' && (
                <form onSubmit={submitReminder} style={{ display: 'flex', flexDirection: 'column', gap: S.xs }}>
                  <input
                    type="text" required placeholder="Label (e.g. Anniversary)"
                    value={reminderForm.label}
                    onChange={e => setReminderForm(p => ({ ...p, label: e.target.value }))}
                    style={inputStyle}
                  />
                  <div style={{ display: 'flex', gap: S.xs }}>
                    <select value={reminderForm.month} onChange={e => setReminderForm(p => ({ ...p, month: parseInt(e.target.value) }))} style={selectStyle}>
                      {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                    </select>
                    <select value={reminderForm.day} onChange={e => setReminderForm(p => ({ ...p, day: parseInt(e.target.value) }))} style={selectStyle}>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <input type="number" placeholder="Year" min={1900} max={2100}
                      value={reminderForm.year}
                      onChange={e => setReminderForm(p => ({ ...p, year: e.target.value }))}
                      style={{ ...selectStyle, flex: 1 }}
                    />
                  </div>
                  <CosmicSnapshot month={reminderForm.month} day={reminderForm.day} birthElement={userBirthInfo?.westernSign.element ?? null} />
                  <FormActions saving={saving} onCancel={resetForms} />
                </form>
              )}

              {/* Goal form */}
              {entryType === 'goal' && (
                <form onSubmit={submitGoal} style={{ display: 'flex', flexDirection: 'column', gap: S.xs }}>
                  <input
                    type="text" required placeholder="What do you want to achieve?"
                    value={goalForm.title}
                    onChange={e => setGoalForm(p => ({ ...p, title: e.target.value }))}
                    style={inputStyle}
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={goalForm.description}
                    onChange={e => setGoalForm(p => ({ ...p, description: e.target.value }))}
                    rows={2}
                    style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
                  />
                  <p style={{ ...lbl, marginBottom: 0 }}>Deadline</p>
                  <div style={{ display: 'flex', gap: S.xs }}>
                    <select value={goalForm.month} onChange={e => setGoalForm(p => ({ ...p, month: parseInt(e.target.value) }))} style={selectStyle}>
                      {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                    </select>
                    <select value={goalForm.day} onChange={e => setGoalForm(p => ({ ...p, day: parseInt(e.target.value) }))} style={selectStyle}>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <input type="number" required placeholder="Year" min={today.getFullYear()} max={2100}
                      value={goalForm.year}
                      onChange={e => setGoalForm(p => ({ ...p, year: e.target.value }))}
                      style={{ ...selectStyle, flex: 1 }}
                    />
                  </div>
                  <CosmicSnapshot month={goalForm.month} day={goalForm.day} birthElement={userBirthInfo?.westernSign.element ?? null} />
                  <FormActions saving={saving} onCancel={resetForms} />
                </form>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingTop: S.lg }}><Attribution /></div>
    </div>
  );
}

function FormActions({ saving, onCancel }: { saving: boolean; onCancel: () => void }) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button type="submit" disabled={saving} style={{
        flex: 1, fontSize: '13px', fontWeight: 500,
        background: 'var(--ink)', color: '#fff', border: 'none',
        borderRadius: '5px', padding: '10px', cursor: 'pointer',
        fontFamily: "'Inter', system-ui, sans-serif", opacity: saving ? 0.5 : 1,
      }}>
        {saving ? 'Saving…' : 'Save'}
      </button>
      <button type="button" onClick={onCancel} style={{
        padding: '10px 14px', fontSize: '13px', background: 'none',
        border: '1px solid var(--border)', borderRadius: '5px',
        color: 'var(--ink-light)', cursor: 'pointer',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        Cancel
      </button>
    </div>
  );
}

function Attribution() {
  return (
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
      <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '11px', color: 'var(--ink-light)', lineHeight: 1.6, margin: 0 }}>
        A side project by Osvaldo Uribe<br />
        <a href="https://instagram.com/art.osv" target="_blank" rel="noopener noreferrer"
          style={{ color: 'var(--ink-light)', textDecoration: 'none' }}>
          @art.osv on Instagram
        </a>
      </p>
    </div>
  );
}
