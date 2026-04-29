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

const LBL: React.CSSProperties = {
  fontFamily: INTER,
  fontSize: '9.5px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--ink-light)',
};

const DIV = <div style={{ height: '1px', background: 'var(--border)', margin: '18px 0' }} />;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '6px 0' }}>
      <span style={LBL}>{label}</span>
      <span style={{ fontFamily: INTER, fontSize: '13px', color: 'var(--ink)', fontWeight: 400 }}>
        {value}
      </span>
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
      fontSize: '9.5px', letterSpacing: '0.08em', fontFamily: INTER,
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: c.dot }} />
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

  if (selectedEvent) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '24px' }}>
        <button onClick={onClearSelection} style={{
          ...LBL, background: 'none', border: 'none', cursor: 'pointer',
          padding: 0, textAlign: 'left', marginBottom: '28px',
        }}>
          ← Today
        </button>
        <div style={{ width: '24px', height: '2px', borderRadius: '1px',
          backgroundColor: selectedEvent.color ?? '#9C9792', marginBottom: '20px' }} />
        <p style={{ ...LBL, marginBottom: '6px' }}>Event</p>
        <h2 style={{ fontFamily: INTER, fontSize: '20px', fontWeight: 500,
          color: 'var(--ink)', lineHeight: 1.2, margin: '0 0 8px' }}>
          {selectedEvent.title}
        </h2>
        <p style={LBL}>
          {new Date(selectedEvent.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        {selectedEvent.description && (
          <>{DIV}<p style={{ fontFamily: INTER, fontSize: '13px', color: 'var(--ink-mid)', lineHeight: 1.65 }}>
            {selectedEvent.description}
          </p></>
        )}
        <div style={{ marginTop: 'auto', paddingTop: '40px' }}><Attribution /></div>
      </div>
    );
  }

  const { zodiac, element, planet, tarot, energyDescription, season, nextFullMoon } = todayInfo;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '24px' }}>

      <div style={{ marginBottom: '24px' }}>
        <p style={{ ...LBL, marginBottom: '8px' }}>{season}</p>
        <h1 style={{ fontFamily: INTER, fontSize: '26px', fontWeight: 300,
          color: 'var(--ink)', lineHeight: 1.1, margin: 0 }}>
          {today.getDate()}
          <span style={{ color: 'var(--ink-light)', margin: '0 5px' }}>·</span>
          {today.toLocaleString('default', { month: 'long' })}
        </h1>
        <p style={{ ...LBL, marginTop: '5px', letterSpacing: '0.12em' }}>
          {today.toLocaleString('default', { weekday: 'long' })}, {today.getFullYear()}
        </p>
      </div>

      {DIV}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px', lineHeight: 1 }}>{zodiac.symbol}</span>
          <span style={{ fontFamily: INTER, fontSize: '16px', fontWeight: 500, color: 'var(--ink)' }}>
            {zodiac.name}
          </span>
        </div>
        <Badge element={element} />
      </div>

      <div style={{ borderTop: '1px solid var(--border)' }}>
        <Row label="Planet" value={planet} />
        <Row label="Tarot"  value={tarot} />
      </div>

      {DIV}

      <p style={{ fontFamily: INTER, fontSize: '13px', color: 'var(--ink-mid)', lineHeight: 1.65, margin: 0 }}>
        {energyDescription}
      </p>

      {DIV}

      <div>
        <p style={{ ...LBL, marginBottom: '12px' }}>Next Full Moon</p>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '15px', color: 'var(--ink-light)', lineHeight: 1, marginTop: '1px' }}>○</span>
          <div>
            <p style={{ fontFamily: INTER, fontSize: '14px', fontWeight: 500,
              color: 'var(--ink)', margin: '0 0 2px' }}>
              {nextFullMoon.name}
            </p>
            <p style={{ ...LBL, letterSpacing: '0.1em', marginBottom: '5px' }}>
              {new Date(nextFullMoon.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p style={{ fontFamily: INTER, fontSize: '12px', color: 'var(--ink-light)', lineHeight: 1.55, margin: 0 }}>
              {nextFullMoon.description}
            </p>
          </div>
        </div>
      </div>

      {isLoggedIn && (
        <div style={{ marginTop: '24px' }}>
          {!showForm ? (
            <button onClick={() => setShowForm(true)} style={{
              width: '100%', background: 'none', border: '1px solid var(--border)',
              borderRadius: '6px', padding: '9px', ...LBL, cursor: 'pointer',
            }}>
              + Mark a date
            </button>
          ) : (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={LBL}>New Date</p>
              {(['title', 'date'] as const).map(f => (
                <input key={f}
                  type={f === 'date' ? 'date' : 'text'}
                  placeholder={f === 'title' ? 'Title' : undefined}
                  value={form[f]} required
                  onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
                  style={{ width: '100%', fontSize: '13px', border: '1px solid var(--border)',
                    borderRadius: '5px', padding: '8px 10px', background: 'transparent',
                    color: 'var(--ink)', fontFamily: INTER, outline: 'none' }}
                />
              ))}
              <textarea placeholder="Notes (optional)" rows={2} value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                style={{ width: '100%', fontSize: '13px', border: '1px solid var(--border)',
                  borderRadius: '5px', padding: '8px 10px', background: 'transparent',
                  color: 'var(--ink)', fontFamily: INTER, outline: 'none', resize: 'none' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" disabled={saving} style={{
                  flex: 1, fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase',
                  background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: '5px',
                  padding: '9px', cursor: 'pointer', fontFamily: INTER, opacity: saving ? 0.5 : 1,
                }}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  padding: '9px 12px', fontSize: '11px', letterSpacing: '0.12em',
                  textTransform: 'uppercase', background: 'none', border: '1px solid var(--border)',
                  borderRadius: '5px', color: 'var(--ink-light)', cursor: 'pointer', fontFamily: INTER,
                }}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingTop: '40px' }}><Attribution /></div>
    </div>
  );
}

function Attribution() {
  return (
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '18px' }}>
      <p style={{ fontFamily: "'Inter', system-ui", fontSize: '9.5px',
        letterSpacing: '0.1em', color: 'var(--ink-light)', lineHeight: 1.6, margin: 0 }}>
        A side project by Osvaldo Uribe<br />
        <a href="https://instagram.com/art.osv" target="_blank" rel="noopener noreferrer"
          style={{ color: 'var(--ink-light)', textDecoration: 'none' }}>
          @art.osv on Instagram
        </a>
      </p>
    </div>
  );
}
