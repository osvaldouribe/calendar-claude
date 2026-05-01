'use client';

import React, { useState } from 'react';
import type { TodayInfo, UserBirthInfo } from '@/lib/cosmic-data';
import { ELEMENT_COLORS } from '@/lib/cosmic-data';
import type { CalendarEvent } from './CircularCalendar';

interface TodayPanelProps {
  today: Date;
  todayInfo: TodayInfo;
  selectedEvent: CalendarEvent | null;
  isLoggedIn: boolean;
  onAddDate?: (data: { label: string; month: number; day: number; year: number | null }) => Promise<void>;
  onClearSelection?: () => void;
  userBirthInfo?: UserBirthInfo | null;
}

const INTER = "'Inter', system-ui, sans-serif";

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Consistent spacing: 8 / 16 / 24 / 32px
const S = { xs: '8px', sm: '16px', md: '24px', lg: '32px' } as const;

// Label: small, muted — no caps, no tracking
const lbl: React.CSSProperties = {
  fontFamily: INTER, fontSize: '11px', color: 'var(--ink-light)',
};

// Thin horizontal rule
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

export default function TodayPanel({
  today, todayInfo, selectedEvent, isLoggedIn, onAddDate, onClearSelection, userBirthInfo,
}: TodayPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: '', month: today.getMonth() + 1, day: today.getDate(), year: '' });
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label) return;
    setSaving(true);
    await onAddDate?.({
      label: form.label,
      month: form.month,
      day:   form.day,
      year:  form.year ? parseInt(form.year) : null,
    });
    setForm({ label: '', month: today.getMonth() + 1, day: today.getDate(), year: '' });
    setShowForm(false);
    setSaving(false);
  };

  // ── selected event view ───────────────────────────────────────────────────
  if (selectedEvent) {
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
        <p style={{ ...lbl, marginBottom: S.xs }}>Event</p>
        <h2 style={{ fontFamily: INTER, fontSize: '18px', fontWeight: 500,
          color: 'var(--ink)', lineHeight: 1.3, margin: `0 0 ${S.xs}` }}>
          {selectedEvent.title}
        </h2>
        <p style={lbl}>
          {new Date(selectedEvent.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
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
  const { zodiac, element, planet, tarot, energyDescription, season, nextFullMoon } = todayInfo;

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

      {/* Birth cosmic signature */}
      {userBirthInfo && (
        <>
          <p style={{ ...lbl, marginBottom: S.sm }}>Your birth</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.sm }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: S.xs }}>
              <span style={{ fontSize: '18px', lineHeight: 1 }}>{userBirthInfo.westernSign.symbol}</span>
              <span style={{ fontFamily: INTER, fontSize: '14px', fontWeight: 500, color: 'var(--ink)' }}>
                {userBirthInfo.westernSign.name}
              </span>
            </div>
            <Badge element={userBirthInfo.westernSign.element} />
          </div>
          <div style={{ borderTop: '1px solid var(--border)' }}>
            <Row label="Planet" value={userBirthInfo.westernSign.planet} />
            <Row label="Tarot"  value={userBirthInfo.westernSign.tarot} />
            <Row label="Chinese year" value={`${userBirthInfo.chineseAnimal.glyph} ${userBirthInfo.chineseAnimal.name} · ${userBirthInfo.chineseAnimal.trait}`} />
            <Row label="Element" value={`${userBirthInfo.chineseElement.name} · ${userBirthInfo.chineseElement.quality}`} />
          </div>
          {HR}
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

      {/* Add event */}
      {isLoggedIn && (
        <div style={{ marginTop: S.md }}>
          {!showForm ? (
            <button onClick={() => setShowForm(true)} style={{
              width: '100%', background: 'none', border: '1px solid var(--border)',
              borderRadius: '6px', padding: '10px', cursor: 'pointer',
              fontFamily: INTER, fontSize: '13px', color: 'var(--ink-light)',
            }}>
              + Mark a date
            </button>
          ) : (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: S.xs }}>
              <p style={lbl}>New date</p>
              <input
                type="text" required placeholder="Label (e.g. Anniversary)"
                value={form.label}
                onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                style={{
                  width: '100%', fontSize: '13px', border: '1px solid var(--border)',
                  borderRadius: '5px', padding: `${S.xs} 10px`, background: 'transparent',
                  color: 'var(--ink)', fontFamily: INTER, outline: 'none', boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: S.xs }}>
                <select value={form.month} onChange={e => setForm(p => ({ ...p, month: parseInt(e.target.value) }))}
                  style={{
                    flex: 1, fontSize: '13px', border: '1px solid var(--border)',
                    borderRadius: '5px', padding: `${S.xs} 8px`, background: 'transparent',
                    color: 'var(--ink)', fontFamily: INTER, outline: 'none', appearance: 'none',
                  }}>
                  {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
                <select value={form.day} onChange={e => setForm(p => ({ ...p, day: parseInt(e.target.value) }))}
                  style={{
                    flex: 1, fontSize: '13px', border: '1px solid var(--border)',
                    borderRadius: '5px', padding: `${S.xs} 8px`, background: 'transparent',
                    color: 'var(--ink)', fontFamily: INTER, outline: 'none', appearance: 'none',
                  }}>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <input type="number" placeholder="Year" min={1900} max={2100}
                  value={form.year}
                  onChange={e => setForm(p => ({ ...p, year: e.target.value }))}
                  style={{
                    flex: 1, fontSize: '13px', border: '1px solid var(--border)',
                    borderRadius: '5px', padding: `${S.xs} 8px`, background: 'transparent',
                    color: 'var(--ink)', fontFamily: INTER, outline: 'none',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: S.xs }}>
                <button type="submit" disabled={saving} style={{
                  flex: 1, fontSize: '13px', fontWeight: 500,
                  background: 'var(--ink)', color: '#fff', border: 'none',
                  borderRadius: '5px', padding: '10px', cursor: 'pointer',
                  fontFamily: INTER, opacity: saving ? 0.5 : 1,
                }}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  padding: '10px 14px', fontSize: '13px', background: 'none',
                  border: '1px solid var(--border)', borderRadius: '5px',
                  color: 'var(--ink-light)', cursor: 'pointer', fontFamily: INTER,
                }}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingTop: S.lg }}><Attribution /></div>
    </div>
  );
}

function Attribution() {
  return (
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: S.sm }}>
      <p style={{ fontFamily: INTER, fontSize: '11px', color: 'var(--ink-light)', lineHeight: 1.6, margin: 0 }}>
        A side project by Osvaldo Uribe<br />
        <a href="https://instagram.com/art.osv" target="_blank" rel="noopener noreferrer"
          style={{ color: 'var(--ink-light)', textDecoration: 'none' }}>
          @art.osv on Instagram
        </a>
      </p>
    </div>
  );
}
