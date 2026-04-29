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
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'var(--bg-cream)',
      fontFamily: 'var(--font-dm-sans)',
    }}>
      {/* Nav — fixed 52px */}
      <nav style={{
        height: '52px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2.5rem',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: 'var(--ink-light)', fontSize: '11px' }}>◎</span>
          <span style={{
            fontSize: '10.5px', letterSpacing: '0.22em',
            textTransform: 'uppercase', color: 'var(--ink-mid)', fontWeight: 500,
          }}>
            Cosmic Calendar
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {isLoggedIn ? (
            <>
              <Link href="/profile" className="hover:text-stone-900 transition-colors" style={{
                fontSize: '10.5px', letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'var(--ink-light)', textDecoration: 'none',
              }}>
                {userEmail}
              </Link>
              <form action="/api/auth/signout" method="POST">
                <button type="submit" className="hover:text-stone-900 transition-colors" style={{
                  fontSize: '10.5px', letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: 'var(--ink-light)', background: 'none', border: 'none',
                  cursor: 'pointer', padding: 0, fontFamily: 'inherit',
                }}>
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-stone-900 transition-colors" style={{
                fontSize: '10.5px', letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'var(--ink-light)', textDecoration: 'none',
              }}>
                Sign in
              </Link>
              <Link href="/signup" style={{
                fontSize: '10.5px', letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'var(--ink)', textDecoration: 'none', fontWeight: 500,
              }}>
                Join
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Body — CSS Grid: calendar fills 1fr, panel is fixed 300px.
          min-height:0 prevents flex children from overflowing the 100vh root. */}
      <div style={{
        flex: 1,
        minHeight: 0,
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
      }}>
        {/* Calendar column — container query so the SVG knows its own box size */}
        <main style={{
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem',
          /* container-type: size lets child use 100cqw / 100cqh */
          containerType: 'size',
        } as React.CSSProperties}>
          {/* min(cqw, cqh) = largest square that fits the content box */}
          <div style={{ width: 'min(100cqw, 100cqh)', aspectRatio: '1' }}>
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

        {/* Side panel — fixed width, scrolls in place */}
        <aside style={{
          borderLeft: '1px solid var(--border)',
          background: '#FFFFFF',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}>
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
