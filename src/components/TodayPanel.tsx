'use client';

import React, { useState } from 'react';
import type { TodayInfo } from '@/lib/cosmic-data';
import { ELEMENT_COLORS } from '@/lib/cosmic-data';
import type { CalendarEvent } from './CircularCalendar';

interface TodayPanelProps {
  today: Date;
  todayInfo: TodayInfo;
  selectedEvent: CalendarEvent | null;
  isLoggedIn: boolean;
  onAddEvent?: (data: { title: string; date: string; description: string }) => Promise<void>;
  onClearSelection?: () => void;
}

const INTER = "'Inter', system-ui, sans-serif";

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
  today, todayInfo, selectedEvent, isLoggedIn, onAddEvent, onClearSelection,
}: TodayPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', description: '' });
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date) return;
    setSaving(true);
    await onAddEvent?.(form);
    setForm({ title: '', date: '', description: '' });
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
              {(['title', 'date'] as const).map(f => (
                <input key={f}
                  type={f === 'date' ? 'date' : 'text'}
                  placeholder={f === 'title' ? 'Title' : undefined}
                  value={form[f]} required
                  onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
                  style={{
                    width: '100%', fontSize: '13px', border: '1px solid var(--border)',
                    borderRadius: '5px', padding: `${S.xs} 10px`, background: 'transparent',
                    color: 'var(--ink)', fontFamily: INTER, outline: 'none',
                  }}
                />
              ))}
              <textarea placeholder="Notes (optional)" rows={2} value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                style={{
                  width: '100%', fontSize: '13px', border: '1px solid var(--border)',
                  borderRadius: '5px', padding: `${S.xs} 10px`, background: 'transparent',
                  color: 'var(--ink)', fontFamily: INTER, outline: 'none', resize: 'none',
                }}
              />
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
