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

function ElementBadge({ element }: { element: string }) {
  const colors = ELEMENT_COLORS[element as keyof typeof ELEMENT_COLORS];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide"
      style={{ backgroundColor: colors.bg, color: colors.text }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.dot }} />
      {element.charAt(0).toUpperCase() + element.slice(1)}
    </span>
  );
}

function Divider() {
  return <div className="border-t border-stone-100 my-5" />;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2">
      <span className="text-xs tracking-widest uppercase text-stone-400"
        style={{ fontFamily: "'DM Sans', system-ui" }}>{label}</span>
      <span className="text-sm text-stone-700"
        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>{value}</span>
    </div>
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
      <aside className="h-full flex flex-col p-8 overflow-y-auto">
        <button onClick={onClearSelection}
          className="text-xs text-stone-400 hover:text-stone-600 tracking-widest uppercase mb-8 text-left transition-colors">
          ← Back to Today
        </button>
        <div className="w-8 h-1 rounded-full mb-6"
          style={{ backgroundColor: selectedEvent.color ?? '#6B7280' }} />
        <p className="text-xs tracking-widest uppercase text-stone-400 mb-2"
          style={{ fontFamily: "'DM Sans', system-ui" }}>Event</p>
        <h2 className="text-2xl text-stone-800 leading-tight mb-3"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 300 }}>
          {selectedEvent.title}
        </h2>
        <p className="text-sm text-stone-500 mb-6"
          style={{ fontFamily: "'DM Sans', system-ui" }}>
          {new Date(selectedEvent.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        {selectedEvent.description && (
          <>
            <Divider />
            <p className="text-sm text-stone-600 leading-relaxed italic"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              {selectedEvent.description}
            </p>
          </>
        )}
      </aside>
    );
  }

  const { zodiac, element, planet, tarot, energyDescription, season, nextFullMoon } = todayInfo;

  return (
    <aside className="h-full flex flex-col p-8 overflow-y-auto">
      <div className="mb-8">
        <p className="text-xs tracking-widest uppercase text-stone-400 mb-1"
          style={{ fontFamily: "'DM Sans', system-ui" }}>{season}</p>
        <h1 className="text-3xl text-stone-800 leading-tight"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 300 }}>
          {today.getDate()}
          <span className="text-stone-400 mx-2">·</span>
          {today.toLocaleString('default', { month: 'long' })}
        </h1>
        <p className="text-sm text-stone-400 mt-1"
          style={{ fontFamily: "'DM Sans', system-ui" }}>
          {today.toLocaleString('default', { weekday: 'long' })}, {today.getFullYear()}
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{zodiac.symbol}</span>
          <p className="text-xl text-stone-700"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 300 }}>
            {zodiac.name}
          </p>
        </div>
        <ElementBadge element={element} />
      </div>

      <div className="border-t border-stone-100">
        <InfoRow label="Planet" value={planet} />
        <InfoRow label="Tarot"  value={tarot} />
      </div>

      <Divider />

      <p className="text-sm text-stone-600 leading-relaxed italic"
        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
        {energyDescription}
      </p>

      <Divider />

      <div>
        <p className="text-xs tracking-widest uppercase text-stone-400 mb-3"
          style={{ fontFamily: "'DM Sans', system-ui" }}>Next Full Moon</p>
        <div className="flex items-start gap-3">
          <span className="text-lg mt-0.5">○</span>
          <div>
            <p className="text-base text-stone-700"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 300 }}>
              {nextFullMoon.name}
            </p>
            <p className="text-xs text-stone-400 mt-0.5"
              style={{ fontFamily: "'DM Sans', system-ui" }}>
              {new Date(nextFullMoon.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed italic"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              {nextFullMoon.description}
            </p>
          </div>
        </div>
      </div>

      {isLoggedIn && (
        <div className="mt-auto pt-8">
          {!showAddForm ? (
            <button onClick={() => setShowAddForm(true)}
              className="w-full text-sm text-stone-500 hover:text-stone-800 border border-stone-200 hover:border-stone-400 rounded-lg py-2.5 tracking-wide transition-all"
              style={{ fontFamily: "'DM Sans', system-ui" }}>
              + Add personal date
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-xs tracking-widest uppercase text-stone-400"
                style={{ fontFamily: "'DM Sans', system-ui" }}>New Date</p>
              <input type="text" placeholder="Title" value={formData.title} required
                onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:border-stone-400 bg-transparent text-stone-700 placeholder:text-stone-300"
                style={{ fontFamily: "'DM Sans', system-ui" }} />
              <input type="date" value={formData.date} required
                onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))}
                className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:border-stone-400 bg-transparent text-stone-700"
                style={{ fontFamily: "'DM Sans', system-ui" }} />
              <textarea placeholder="Notes (optional)" rows={2} value={formData.description}
                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:border-stone-400 bg-transparent text-stone-700 placeholder:text-stone-300 resize-none"
                style={{ fontFamily: "'DM Sans', system-ui" }} />
              <div className="flex gap-2">
                <button type="submit" disabled={saving}
                  className="flex-1 text-sm bg-stone-800 text-white rounded-lg py-2 hover:bg-stone-700 disabled:opacity-50 transition-colors"
                  style={{ fontFamily: "'DM Sans', system-ui" }}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowAddForm(false)}
                  className="px-4 text-sm text-stone-400 hover:text-stone-600 transition-colors"
                  style={{ fontFamily: "'DM Sans', system-ui" }}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </aside>
  );
}