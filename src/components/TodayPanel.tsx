'use client';

import React, { useState, useMemo } from 'react';
import type { TodayInfo, UserBirthInfo, Element } from '@/lib/cosmic-data';
import { ELEMENT_COLORS, getTodayInfo, getPersonalNote } from '@/lib/cosmic-data';
import type { CalendarEvent, GoalEvent } from './CircularCalendar';

// ── entry type registry ───────────────────────────────────────────────────────
const ENTRY_TYPES = [
  { key: 'reminder' as const, label: 'Reminder' },
  { key: 'goal'     as const, label: 'Goal'     },
] satisfies { key: string; label: string }[];

type EntryType = typeof ENTRY_TYPES[number]['key'];

// ── goal energy alignment ─────────────────────────────────────────────────────
const GOAL_ENERGY: Record<string, string> = {
  fire:  'initiation — act before you feel ready',
  earth: 'discipline — small consistent steps compound',
  air:   'clarity — write it down, refine the plan',
  water: 'intention — reconnect with why it matters',
};

// ── full moon preparation by birth element ────────────────────────────────────
const MOON_PREP: Record<string, string> = {
  fire:  'Release what drains your momentum. Set one bold intention for the cycle ahead.',
  earth: 'Complete what you started. Let go of whatever clutters your foundation.',
  air:   'Clear mental space. Write down what no longer serves your vision.',
  water: 'Let feelings surface without judgment. The full moon is your mirror — look honestly.',
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
  margin: 0,
};

function Divider() {
  return <div style={{ height: '1px', background: 'var(--border)', margin: '20px 0' }} />;
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

// Used in event/goal detail views
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

  const c = ELEMENT_COLORS[info.element as keyof typeof ELEMENT_COLORS];

  return (
    <div style={{
      background: 'var(--bg-cream)', borderRadius: '8px',
      padding: '12px', border: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '16px', lineHeight: 1, color: c.dot }}>{info.zodiac.symbol}</span>
          <span style={{ fontFamily: INTER, fontSize: '13px', fontWeight: 500, color: 'var(--ink)' }}>
            {info.zodiac.name}
          </span>
        </div>
        <Badge element={info.element} />
      </div>
      <p style={{ fontFamily: INTER, fontSize: '12px', color: 'var(--ink-mid)', lineHeight: 1.6, margin: 0 }}>
        {info.energyDescription}
      </p>
      {personalNote && (
        <div style={{ borderTop: '1px solid var(--border)', marginTop: '10px', paddingTop: '10px' }}>
          <p style={{ fontFamily: INTER, fontSize: '11px', color: 'var(--ink-light)', lineHeight: 1.6, margin: 0 }}>
            {personalNote}
          </p>
        </div>
      )}
    </div>
  );
}

// ── shared input styles ───────────────────────────────────────────────────────
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
  const [entryType, setEntryType] = useState<EntryType>('reminder');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving]       = useState(false);

  const [reminderForm, setReminderForm] = useState({
    label: '', month: today.getMonth() + 1, day: today.getDate(), year: '',
  });
  const [goalForm, setGoalForm] = useState({
    title: '', description: '',
    month: today.getMonth() + 1, day: today.getDate(), year: String(today.getFullYear()),
  });

  const closeModal = () => {
    setReminderForm({ label: '', month: today.getMonth() + 1, day: today.getDate(), year: '' });
    setGoalForm({ title: '', description: '', month: today.getMonth() + 1, day: today.getDate(), year: String(today.getFullYear()) });
    setEntryType('reminder');
    setSaving(false);
    setModalOpen(false);
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
    closeModal();
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
    closeModal();
  };

  const { zodiac, element, energyDescription, season, nextFullMoon } = todayInfo;
  const elementColors = ELEMENT_COLORS[element];
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
        <Divider />
        <p style={{ ...lbl, marginBottom: S.xs }}>Energy today</p>
        <p style={{ fontFamily: INTER, fontSize: '13px', color: 'var(--ink-mid)', lineHeight: 1.6, margin: 0 }}>
          {element.charAt(0).toUpperCase() + element.slice(1)} energy favors {GOAL_ENERGY[element] ?? 'focus and intention'}. Use it.
        </p>
        {selectedGoal.description && (
          <><Divider />
          <p style={{ fontFamily: INTER, fontSize: '13px', color: 'var(--ink-mid)', lineHeight: 1.6, margin: 0 }}>
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
          <><Divider />
          <p style={{ fontFamily: INTER, fontSize: '13px', color: 'var(--ink-mid)', lineHeight: 1.6, margin: 0 }}>
            {selectedEvent.description}
          </p></>
        )}
        <div style={{ marginTop: 'auto', paddingTop: S.lg }}><Attribution /></div>
      </div>
    );
  }

  // ── today view ────────────────────────────────────────────────────────────
  const moonDate = new Date(nextFullMoon.date);
  const moonDateStr = moonDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: S.md }}>

        {/* 1 · Date + cosmic energy */}
        <p style={{ ...lbl, marginBottom: '5px' }}>
          {today.toLocaleString('default', { weekday: 'long' })}, {season}
        </p>
        <h1 style={{
          fontFamily: INTER, fontSize: '24px', fontWeight: 300,
          color: 'var(--ink)', lineHeight: 1.1, margin: '0 0 10px',
        }}>
          {today.getDate()}
          <span style={{ color: 'var(--ink-light)', margin: '0 6px' }}>·</span>
          {today.toLocaleString('default', { month: 'long' })}
          <span style={{ color: 'var(--ink-light)', fontSize: '15px', marginLeft: '6px', fontWeight: 300 }}>
            {today.getFullYear()}
          </span>
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <span style={{ fontSize: '14px', lineHeight: 1, color: elementColors.dot }}>{zodiac.symbol}</span>
          <span style={{ fontFamily: INTER, fontSize: '12px', color: 'var(--ink-light)' }}>{zodiac.name}</span>
          <Badge element={element} />
        </div>
        <p style={{ fontFamily: INTER, fontSize: '13px', color: 'var(--ink-mid)', lineHeight: 1.65, margin: 0 }}>
          {energyDescription}
        </p>

        {/* 2 · How energy affects my sign */}
        {userBirthInfo && (
          <>
            <Divider />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', lineHeight: 1, color: ELEMENT_COLORS[userBirthInfo.westernSign.element].dot }}>
                {userBirthInfo.westernSign.symbol}
              </span>
              <span style={lbl}>{userBirthInfo.westernSign.name}</span>
            </div>
            <p style={{ fontFamily: INTER, fontSize: '13px', color: 'var(--ink-mid)', lineHeight: 1.65, margin: 0 }}>
              {userBirthInfo.personalNote}
            </p>
          </>
        )}

        {/* 3 · Full moon */}
        <Divider />
        <p style={{ ...lbl, marginBottom: '8px' }}>Next full moon</p>
        <p style={{
          fontFamily: INTER, fontSize: '14px', fontWeight: 500,
          color: 'var(--ink)', margin: '0 0 3px',
        }}>
          {nextFullMoon.name}
        </p>
        <p style={{ ...lbl, marginBottom: userBirthInfo ? '10px' : 0 }}>{moonDateStr}</p>
        {userBirthInfo && (
          <p style={{ fontFamily: INTER, fontSize: '12px', color: 'var(--ink-mid)', lineHeight: 1.6, margin: 0 }}>
            {MOON_PREP[userBirthInfo.westernSign.element] ?? nextFullMoon.description}
          </p>
        )}

        {/* 4 · Goals */}
        {isLoggedIn && currentYearGoals.length > 0 && (
          <>
            <Divider />
            <p style={{ ...lbl, marginBottom: '10px' }}>Goals · {today.getFullYear()}</p>
            {currentYearGoals.map(goal => {
              const days = daysUntil(goal.targetMonth, goal.targetDay, goal.targetYear);
              const urgent = days >= 0 && days <= 30;
              return (
                <div key={goal.id} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', padding: '6px 0',
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

        <div style={{ marginTop: 'auto', paddingTop: S.lg }}><Attribution /></div>
      </div>

      {/* 5 · Anchored + button */}
      {isLoggedIn && (
        <div style={{
          position: 'sticky', bottom: 0,
          background: '#fff',
          borderTop: '1px solid var(--border)',
          padding: '12px 24px',
        }}>
          <button
            onClick={() => setModalOpen(true)}
            style={{
              width: '100%', background: 'none',
              border: '1px solid var(--border)',
              borderRadius: '6px', padding: '9px',
              cursor: 'pointer', fontFamily: INTER,
              fontSize: '16px', color: 'var(--ink-light)',
              lineHeight: 1, transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = elementColors.dot;
              (e.currentTarget as HTMLButtonElement).style.color = elementColors.dot;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-light)';
            }}
          >
            +
          </button>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(28, 25, 23, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, padding: '24px',
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: '#fff', borderRadius: '10px',
              padding: '24px', width: '100%', maxWidth: '300px',
              maxHeight: '80vh', overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Type picker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
              {ENTRY_TYPES.map(({ key, label }, i) => (
                <React.Fragment key={key}>
                  {i > 0 && (
                    <span style={{ fontFamily: INTER, fontSize: '12px', color: 'var(--ink-light)' }}>·</span>
                  )}
                  <button
                    onClick={() => setEntryType(key)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: INTER, fontSize: '13px', padding: 0,
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
                <FormActions saving={saving} onCancel={closeModal} />
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
                <FormActions saving={saving} onCancel={closeModal} />
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function FormActions({ saving, onCancel }: { saving: boolean; onCancel: () => void }) {
  return (
    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
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
