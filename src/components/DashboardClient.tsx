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
  const [events, setEvents]               = useState<CalendarEvent[]>(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedEvent(null);
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
    <div className="h-screen flex flex-col bg-stone-50" style={{ fontFamily: "'DM Sans', system-ui" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <span className="text-stone-300 text-sm">◎</span>
          <span className="text-sm tracking-widest uppercase text-stone-500"
            style={{ letterSpacing: '0.15em' }}>
            Cosmic Calendar
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-stone-400 tracking-wide">
          {isLoggedIn ? (
            <>
              <Link href="/profile"
                className="hover:text-stone-700 transition-colors tracking-widest uppercase">
                {userEmail}
              </Link>
              <form action="/api/auth/signout" method="POST">
                <button type="submit"
                  className="tracking-widest uppercase hover:text-stone-700 transition-colors">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login"
                className="tracking-widest uppercase hover:text-stone-700 transition-colors">
                Sign in
              </Link>
              <Link href="/signup"
                className="tracking-widest uppercase text-stone-700 hover:text-stone-900 transition-colors">
                Join
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 flex items-center justify-center p-8 overflow-hidden">
          <div className="w-full h-full flex items-center justify-center"
            style={{ maxWidth: '600px', maxHeight: '600px' }}>
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
        <aside className="w-80 xl:w-96 border-l border-stone-100 bg-white overflow-y-auto flex-shrink-0">
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