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
  // Mobile bottom-sheet state
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
      setEvents((prev) => [...prev, created]);
      router.refresh();
    }
  }, [router]);

  return (
    <div style={{
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'var(--bg-cream)',
      fontFamily: 'var(--font-dm-sans)',
    }}>
      {/* Nav */}
      <nav style={{
        height: '52px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {isLoggedIn ? (
            <>
              <Link href="/profile" className="hover:text-stone-900 transition-colors" style={{
                fontSize: '10.5px', letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--ink-light)', textDecoration: 'none',
              }}>
                {userEmail}
              </Link>
              <form action="/api/auth/signout" method="POST">
                <button type="submit" className="hover:text-stone-900 transition-colors" style={{
                  fontSize: '10.5px', letterSpacing: '0.12em', textTransform: 'uppercase',
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
                fontSize: '10.5px', letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--ink-light)', textDecoration: 'none',
              }}>
                Sign in
              </Link>
              <Link href="/signup" style={{
                fontSize: '10.5px', letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--ink)', textDecoration: 'none', fontWeight: 500,
              }}>
                Join
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── DESKTOP: side-by-side grid ────────────────────────────────────── */}
      <div className="hidden md:grid" style={{
        flex: 1,
        minHeight: 0,
        gridTemplateColumns: '1fr 300px',
      }}>
        <main style={{
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          /* container-type lets the child use 100cqw / 100cqh */
          containerType: 'size',
        } as React.CSSProperties}>
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

      {/* ── MOBILE: calendar + bottom sheet ───────────────────────────────── */}
      <div className="flex md:hidden" style={{
        flex: 1,
        minHeight: 0,
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Calendar — full width, fills most of the screen */}
        <div style={{ flex: 1, minHeight: 0, padding: '0.75rem', overflow: 'hidden' }}>
          <CircularCalendar
            today={todayDate}
            events={events}
            fullMoons={fullMoons}
            zodiacSigns={zodiacSigns}
            selectedEventId={selectedEvent?.id ?? null}
            onEventClick={(ev) => { handleEventClick(ev); setSheetOpen(true); }}
            onTodayClick={() => { handleClearSelection(); setSheetOpen(false); }}
          />
        </div>

        {/* Bottom sheet — always visible, slides open on interaction */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: '#FFFFFF',
            borderRadius: '16px 16px 0 0',
            borderTop: '1px solid var(--border)',
            boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
            transform: sheetOpen ? 'translateY(0)' : 'translateY(calc(100% - 80px))',
            transition: 'transform 0.35s cubic-bezier(0.32,0.72,0,1)',
            maxHeight: '82dvh',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10,
          }}
        >
          {/* Drag handle + peek header — always visible */}
          <button
            onClick={() => setSheetOpen(o => !o)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '12px 20px 8px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '10px', width: '100%',
              textAlign: 'left',
            }}
          >
            <div style={{
              width: '32px', height: '3px', borderRadius: '2px',
              background: 'var(--border)',
            }} />
            {/* Peek: show date + zodiac symbol */}
            {!sheetOpen && (
              <div style={{
                width: '100%', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <span style={{
                    fontFamily: 'var(--font-dm-serif)',
                    fontSize: '18px', color: 'var(--ink)',
                  }}>
                    {todayDate.getDate()} · {todayDate.toLocaleString('default', { month: 'long' })}
                  </span>
                  <p style={{
                    fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase',
                    color: 'var(--ink-light)', margin: '2px 0 0', fontFamily: 'var(--font-dm-sans)',
                  }}>
                    {todayInfo.season} · {todayInfo.zodiac.name}
                  </p>
                </div>
                <span style={{ fontSize: '20px' }}>{todayInfo.zodiac.symbol}</span>
              </div>
            )}
          </button>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <TodayPanel
              today={todayDate}
              todayInfo={todayInfo}
              selectedEvent={selectedEvent}
              isLoggedIn={isLoggedIn}
              onAddEvent={handleAddEvent}
              onClearSelection={handleClearSelection}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
