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

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-dm-sans)',
  fontSize: '9.5px',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--ink-light)',
};

const VALUE_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-dm-serif)',
  fontSize: '14px',
  color: 'var(--ink)',
};

const DIVIDER = (
  <div style={{ height: '1px', background: 'var(--border)', margin: '20px 0' }} />
);

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '7px 0' }}>
      <span style={LABEL_STYLE}>{label}</span>
      <span style={VALUE_STYLE}>{value}</span>
    </div>
  );
}

function ElementBadge({ element }: { element: string }) {
  const colors = ELEMENT_COLORS[element as keyof typeof ELEMENT_COLORS];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '3px 10px', borderRadius: '99px',
      backgroundColor: colors.bg, color: colors.text,
      fontSize: '10px', letterSpacing: '0.1em', fontFamily: 'var(--font-dm-sans)',
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: colors.dot, display: 'inline-block' }} />
      {element.charAt(0).toUpperCase() + element.slice(1)}
    </span>
  );
}

export default function TodayPanel({
  today, todayInfo, selectedEvent, isLoggedIn, onAddEvent, onClearSelection,
}: TodayPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', date: '', description: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return;
    setSaving(true);
    await onAddEvent?.(formData);
    setFormData({ title: '', date: '', description: '' });
    setShowAddForm(false);
    setSaving(false);
  };

  if (selectedEvent) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '24px 24px' }}>
        <button
          onClick={onClearSelection}
          style={{
            ...LABEL_STYLE,
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            textAlign: 'left', marginBottom: '32px',
          }}
          className="hover:text-stone-900 transition-colors"
        >
          ← Today
        </button>
        <div style={{
          width: '28px', height: '3px', borderRadius: '2px',
          backgroundColor: selectedEvent.color ?? '#9C9792',
          marginBottom: '24px',
        }} />
        <p style={{ ...LABEL_STYLE, marginBottom: '8px' }}>Event</p>
        <h2 style={{
          fontFamily: 'var(--font-dm-serif)',
          fontSize: '22px', color: 'var(--ink)',
          fontWeight: 400, lineHeight: 1.25, margin: '0 0 10px',
        }}>
          {selectedEvent.title}
        </h2>
        <p style={{ ...LABEL_STYLE, letterSpacing: '0.1em' }}>
          {new Date(selectedEvent.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        {selectedEvent.description && (
          <>
            {DIVIDER}
            <p style={{
              fontFamily: 'var(--font-dm-serif)',
              fontSize: '13.5px', color: 'var(--ink-mid)',
              lineHeight: 1.7, fontStyle: 'italic',
            }}>
              {selectedEvent.description}
            </p>
          </>
        )}
        <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
          <Attribution />
        </div>
      </div>
    );
  }

  const { zodiac, element, planet, tarot, energyDescription, season, nextFullMoon } = todayInfo;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '24px 24px' }}>

      {/* Date header */}
      <div style={{ marginBottom: '28px' }}>
        <p style={{ ...LABEL_STYLE, marginBottom: '10px' }}>{season}</p>
        <h1 style={{
          fontFamily: 'var(--font-dm-serif)',
          fontSize: '28px', color: 'var(--ink)',
          fontWeight: 400, lineHeight: 1.1, margin: 0,
        }}>
          {today.getDate()}
          <span style={{ color: 'var(--ink-light)', margin: '0 6px' }}>·</span>
          {today.toLocaleString('default', { month: 'long' })}
        </h1>
        <p style={{ ...LABEL_STYLE, marginTop: '6px', letterSpacing: '0.12em' }}>
          {today.toLocaleString('default', { weekday: 'long' })},{' '}
          {today.getFullYear()}
        </p>
      </div>

      {DIVIDER}

      {/* Zodiac */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px', lineHeight: 1 }}>{zodiac.symbol}</span>
          <span style={{
            fontFamily: 'var(--font-dm-serif)',
            fontSize: '18px', color: 'var(--ink)', fontWeight: 400,
          }}>
            {zodiac.name}
          </span>
        </div>
        <ElementBadge element={element} />
      </div>

      <div style={{ borderTop: '1px solid var(--border)' }}>
        <InfoRow label="Planet" value={planet} />
        <InfoRow label="Tarot"  value={tarot} />
      </div>

      {DIVIDER}

      <p style={{
        fontFamily: 'var(--font-dm-serif)',
        fontSize: '13.5px', color: 'var(--ink-mid)',
        lineHeight: 1.75, fontStyle: 'italic', margin: 0,
      }}>
        {energyDescription}
      </p>

      {DIVIDER}

      {/* Full Moon */}
      <div>
        <p style={{ ...LABEL_STYLE, marginBottom: '14px' }}>Next Full Moon</p>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '16px', lineHeight: 1, marginTop: '2px', color: 'var(--ink-light)' }}>○</span>
          <div>
            <p style={{
              fontFamily: 'var(--font-dm-serif)',
              fontSize: '15px', color: 'var(--ink)', fontWeight: 400, margin: '0 0 3px',
            }}>
              {nextFullMoon.name}
            </p>
            <p style={{ ...LABEL_STYLE, letterSpacing: '0.1em', marginBottom: '6px' }}>
              {new Date(nextFullMoon.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p style={{
              fontFamily: 'var(--font-dm-serif)',
              fontSize: '12.5px', color: 'var(--ink-light)', lineHeight: 1.6, fontStyle: 'italic', margin: 0,
            }}>
              {nextFullMoon.description}
            </p>
          </div>
        </div>
      </div>

      {/* Add event (logged in only) */}
      {isLoggedIn && (
        <div style={{ marginTop: '28px' }}>
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                width: '100%',
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '10px',
                ...LABEL_STYLE,
                cursor: 'pointer',
                letterSpacing: '0.15em',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              className="hover:border-stone-500 hover:text-stone-900"
            >
              + Mark a date
            </button>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={LABEL_STYLE}>New Date</p>
              {(['title', 'date'] as const).map((field) => (
                <input
                  key={field}
                  type={field === 'date' ? 'date' : 'text'}
                  placeholder={field === 'title' ? 'Title' : undefined}
                  value={formData[field]}
                  required
                  onChange={(e) => setFormData(p => ({ ...p, [field]: e.target.value }))}
                  style={{
                    width: '100%', fontSize: '13px',
                    border: '1px solid var(--border)', borderRadius: '5px',
                    padding: '8px 10px', background: 'transparent',
                    color: 'var(--ink)', fontFamily: 'var(--font-dm-sans)',
                    outline: 'none',
                  }}
                />
              ))}
              <textarea
                placeholder="Notes (optional)"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                style={{
                  width: '100%', fontSize: '13px',
                  border: '1px solid var(--border)', borderRadius: '5px',
                  padding: '8px 10px', background: 'transparent',
                  color: 'var(--ink)', fontFamily: 'var(--font-dm-sans)',
                  outline: 'none', resize: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1, fontSize: '11px', letterSpacing: '0.15em',
                    textTransform: 'uppercase', background: 'var(--ink)',
                    color: '#fff', border: 'none', borderRadius: '5px',
                    padding: '9px', cursor: 'pointer', fontFamily: 'var(--font-dm-sans)',
                    opacity: saving ? 0.5 : 1, transition: 'opacity 0.2s',
                  }}
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  style={{
                    padding: '9px 14px', fontSize: '11px', letterSpacing: '0.15em',
                    textTransform: 'uppercase', background: 'none',
                    border: '1px solid var(--border)', borderRadius: '5px',
                    color: 'var(--ink-light)', cursor: 'pointer',
                    fontFamily: 'var(--font-dm-sans)', transition: 'color 0.2s',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Attribution — pushed to bottom */}
      <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
        <Attribution />
      </div>
    </div>
  );
}

function Attribution() {
  return (
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
      <p style={{
        fontFamily: 'var(--font-dm-sans)',
        fontSize: '9.5px', letterSpacing: '0.12em', color: 'var(--ink-light)',
        lineHeight: 1.7, margin: 0,
      }}>
        A side project by Osvaldo Uribe
        <br />
        <a
          href="https://instagram.com/art.osv"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--ink-light)', textDecoration: 'none' }}
          className="hover:text-stone-900 transition-colors"
        >
          @art.osv on Instagram
        </a>
      </p>
    </div>
  );
}
