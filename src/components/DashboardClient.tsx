'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CircularCalendar, { type CalendarEvent } from './CircularCalendar';
import TodayPanel from './TodayPanel';
import type { TodayInfo, ZodiacSign, FullMoon } from '@/lib/cosmic-data';

interface Props {
  today: string;
  todayInfo: TodayInfo;
  events: CalendarEvent[];
  zodiacSigns: ZodiacSign[];
  fullMoons: FullMoon[];
  isLoggedIn: boolean;
  userEmail: string | null;
}

const INTER = "'Inter', system-ui, sans-serif";

export default function DashboardClient({
  today, todayInfo, events: initialEvents,
  zodiacSigns, fullMoons, isLoggedIn, userEmail,
}: Props) {
  const router = useRouter();
  const todayDate = new Date(today);
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setSheetOpen(true);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedEvent(null);
    setSheetOpen(false);
  }, []);

  const handleAddEvent = useCallback(async (data: {
    title: string; date: string; description: string;
  }) => {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      setEvents(prev => [...prev, created]);
      router.refresh();
    }
  }, [router]);

  const calendarEl = (
    <CircularCalendar
      today={todayDate}
      events={events}
      fullMoons={fullMoons}
      zodiacSigns={zodiacSigns}
      selectedEventId={selectedEvent?.id ?? null}
      onEventClick={handleEventClick}
      onTodayClick={handleClearSelection}
    />
  );

  const panelEl = (
    <TodayPanel
      today={todayDate}
      todayInfo={todayInfo}
      selectedEvent={selectedEvent}
      isLoggedIn={isLoggedIn}
      onAddEvent={handleAddEvent}
      onClearSelection={handleClearSelection}
    />
  );

  return (
    <div style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      overflow: 'hidden', background: 'var(--bg-cream)', fontFamily: INTER,
    }}>
      {/* Nav */}
      <nav style={{
        height: '52px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.5rem', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: 'var(--ink-light)', fontSize: '11px' }}>◎</span>
          <span style={{
            fontSize: '10.5px', letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'var(--ink-mid)', fontWeight: 500, fontFamily: INTER,
          }}>
            Cosmic Calendar
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {isLoggedIn ? (
            <>
              <Link href="/profile" style={{
                fontSize: '10.5px', letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--ink-light)', textDecoration: 'none', fontFamily: INTER,
              }}>
                {userEmail}
              </Link>
              <form action="/api/auth/signout" method="POST">
                <button type="submit" style={{
                  fontSize: '10.5px', letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: 'var(--ink-light)', background: 'none', border: 'none',
                  cursor: 'pointer', padding: 0, fontFamily: INTER,
                }}>
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" style={{
                fontSize: '10.5px', letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--ink-light)', textDecoration: 'none', fontFamily: INTER,
              }}>
                Sign in
              </Link>
              <Link href="/signup" style={{
                fontSize: '10.5px', letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--ink)', textDecoration: 'none', fontWeight: 600, fontFamily: INTER,
              }}>
                Join
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── DESKTOP layout (CSS class, always in stylesheet) ── */}
      <div className="layout-desktop">
        <main style={{
          overflow: 'hidden', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem',
          containerType: 'size',
        } as React.CSSProperties}>
          <div style={{ width: 'min(100cqw, 100cqh)', aspectRatio: '1' }}>
            {calendarEl}
          </div>
        </main>

        <aside style={{
          borderLeft: '1px solid var(--border)', background: '#fff',
          overflowY: 'auto', display: 'flex', flexDirection: 'column',
        }}>
          {panelEl}
        </aside>
      </div>

      {/* ── MOBILE layout (CSS class, always in stylesheet) ── */}
      <div className="layout-mobile">
        {/* Calendar fills available height */}
        <div style={{ flex: 1, minHeight: 0, padding: '0.5rem', overflow: 'hidden' }}>
          {calendarEl}
        </div>

        {/* Bottom sheet */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: '#fff',
          borderRadius: '16px 16px 0 0',
          borderTop: '1px solid var(--border)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
          transform: sheetOpen ? 'translateY(0)' : 'translateY(calc(100% - 76px))',
          transition: 'transform 0.35s cubic-bezier(0.32,0.72,0,1)',
          maxHeight: '80dvh',
          display: 'flex', flexDirection: 'column',
          zIndex: 10,
        }}>
          {/* Drag handle — always visible */}
          <button
            onClick={() => setSheetOpen(o => !o)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '10px 20px 6px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '8px', width: '100%', textAlign: 'left',
            }}
          >
            <div style={{ width: '32px', height: '3px', borderRadius: '2px', background: 'var(--border)' }} />
            {!sheetOpen && (
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '17px', fontWeight: 400, color: 'var(--ink)', fontFamily: INTER }}>
                    {todayDate.getDate()} · {todayDate.toLocaleString('default', { month: 'long' })}
                  </span>
                  <p style={{ fontSize: '9.5px', letterSpacing: '0.15em', textTransform: 'uppercase',
                    color: 'var(--ink-light)', margin: '2px 0 0', fontFamily: INTER }}>
                    {todayInfo.season} · {todayInfo.zodiac.name}
                  </p>
                </div>
                <span style={{ fontSize: '18px' }}>{todayInfo.zodiac.symbol}</span>
              </div>
            )}
          </button>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {panelEl}
          </div>
        </div>
      </div>
    </div>
  );
}
