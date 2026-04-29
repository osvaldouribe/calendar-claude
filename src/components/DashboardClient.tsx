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

export default function DashboardClient({
  today, todayInfo, events: initialEvents,
  zodiacSigns, fullMoons, isLoggedIn, userEmail,
}: Props) {
  const router = useRouter();
  const todayDate = new Date(today);
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const handleEventClick = useCallback((event: CalendarEvent) => setSelectedEvent(event), []);
  const handleClearSelection = useCallback(() => setSelectedEvent(null), []);

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
      setEvents((prev) => [...prev, created]);
      router.refresh();
    }
  }, [router]);

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: 'var(--bg-cream)', fontFamily: 'var(--font-dm-sans)' }}
    >
      {/* Nav */}
      <nav
        className="flex items-center justify-between flex-shrink-0"
        style={{
          padding: '0 2.5rem',
          height: '52px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-3">
          <span style={{ color: 'var(--ink-light)', fontSize: '11px', lineHeight: 1 }}>◎</span>
          <span style={{
            fontSize: '10.5px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--ink-mid)',
            fontWeight: 500,
          }}>
            Cosmic Calendar
          </span>
        </div>

        <div className="flex items-center" style={{ gap: '24px' }}>
          {isLoggedIn ? (
            <>
              <Link
                href="/profile"
                style={{
                  fontSize: '10.5px', letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: 'var(--ink-light)', textDecoration: 'none',
                }}
                className="hover:text-stone-900 transition-colors"
              >
                {userEmail}
              </Link>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  style={{
                    fontSize: '10.5px', letterSpacing: '0.15em', textTransform: 'uppercase',
                    color: 'var(--ink-light)', background: 'none', border: 'none', cursor: 'pointer',
                    padding: 0, fontFamily: 'inherit',
                  }}
                  className="hover:text-stone-900 transition-colors"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                style={{
                  fontSize: '10.5px', letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: 'var(--ink-light)', textDecoration: 'none',
                }}
                className="hover:text-stone-900 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                style={{
                  fontSize: '10.5px', letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: 'var(--ink)', textDecoration: 'none', fontWeight: 500,
                }}
              >
                Join
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Calendar — fills the viewport, constrained to a square by the smaller of width/height */}
        <main className="flex-1 flex items-center justify-center overflow-hidden min-w-0 p-10">
          <div style={{ width: 'min(100%, calc(100vh - 7rem))', flexShrink: 0 }}>
            <CircularCalendar
              today={todayDate}
              events={events}
              fullMoons={fullMoons}
              zodiacSigns={zodiacSigns}
              selectedEventId={selectedEvent?.id ?? null}
              onEventClick={handleEventClick}
              onTodayClick={handleClearSelection}
            />
          </div>
        </main>

        {/* Side panel */}
        <aside
          className="flex-shrink-0 overflow-y-auto flex flex-col"
          style={{
            width: '300px',
            borderLeft: '1px solid var(--border)',
            background: '#FFFFFF',
          }}
        >
          <TodayPanel
            today={todayDate}
            todayInfo={todayInfo}
            selectedEvent={selectedEvent}
            isLoggedIn={isLoggedIn}
            onAddEvent={handleAddEvent}
            onClearSelection={handleClearSelection}
          />
        </aside>
      </div>
    </div>
  );
}
