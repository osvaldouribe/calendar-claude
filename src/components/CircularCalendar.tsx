'use client';

import React, { useCallback } from 'react';
import type { ZodiacSign, FullMoon } from '@/lib/cosmic-data';
import { getDayOfYear, getDaysInYear } from '@/lib/cosmic-data';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  description?: string | null;
  color?: string | null;
}

export interface CircularCalendarProps {
  today: Date;
  events: CalendarEvent[];
  fullMoons: FullMoon[];
  zodiacSigns: ZodiacSign[];
  selectedEventId?: string | null;
  onEventClick?: (event: CalendarEvent) => void;
  onTodayClick?: () => void;
}

// ── viewBox: 900×900 so labels have room to breathe on all sides ─────────────
const CX = 450;
const CY = 450;

const R = {
  outerRing:   225,   // main ring — colored arcs live here
  moonDotR:    225,   // full moon circles sit on the outer ring
  eventRing:   190,
  innerCircle:  75,
  todayLine:   225,
} as const;

// ── geometry ──────────────────────────────────────────────────────────────────

function polar(r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function dayToAngle(day: number, total: number): number {
  return ((day - 1) / total) * 360;
}

function arcPath(r: number, a1: number, a2: number): string {
  const s = polar(r, a1);
  const e = polar(r, a2);
  const span = ((a2 - a1) + 360) % 360;
  return `M ${s.x.toFixed(1)},${s.y.toFixed(1)} A ${r},${r} 0 ${span > 180 ? 1 : 0},1 ${e.x.toFixed(1)},${e.y.toFixed(1)}`;
}

function doyToLabel(doy: number, year: number): string {
  return new Date(year, 0, doy).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── design tokens ─────────────────────────────────────────────────────────────

const ELEMENT_COLOR: Record<string, string> = {
  fire:  '#C8673A',
  earth: '#7A9B5A',
  air:   '#5B90C0',
  water: '#4A6FA5',
};

const MOON_BLUE  = '#5B90C0';
const INK        = '#1C1917';
const INK_MID    = '#6B6560';
const INK_LIGHT  = '#9C9792';
const CREAM      = '#F7F5F0';

const SANS  = "'DM Sans', system-ui, sans-serif";
const SERIF = "'DM Serif Display', Georgia, serif";

// One-line "Best for" per sign — kept to ~35 chars so they don't overflow
const BEST_FOR: Record<string, string> = {
  Capricorn:   'Goal setting, building foundations.',
  Aquarius:    'Innovation, networking, humanitarian work.',
  Pisces:      'Introspection, creativity, spiritual practice.',
  Aries:       'New beginnings, taking action, leadership.',
  Taurus:      'Grounding, beauty, slow purposeful work.',
  Gemini:      'Communication, learning, networking.',
  Cancer:      'Nurturing, home improvement, connections.',
  Leo:         'Creative expression, leadership, celebration.',
  Virgo:       'Organization, health focus, skill development.',
  Libra:       'Relationships, beauty, seeking balance.',
  Scorpio:     'Deep transformation, research, mystery work.',
  Sagittarius: 'Adventure, learning, expansion, travel.',
};

const SEASONS = [
  { label: 'Winter Solstice', date: 'Dec 21', approxDay: 355 },
  { label: 'Spring Equinox',  date: 'Mar 20', approxDay: 80  },
  { label: 'Summer Solstice', date: 'Jun 21', approxDay: 172 },
  { label: 'Autumn Equinox',  date: 'Sep 22', approxDay: 265 },
];

const MONTHS = [
  { name: 'January',   days: 31 }, { name: 'February',  days: 28 },
  { name: 'March',     days: 31 }, { name: 'April',     days: 30 },
  { name: 'May',       days: 31 }, { name: 'June',      days: 30 },
  { name: 'July',      days: 31 }, { name: 'August',    days: 31 },
  { name: 'September', days: 30 }, { name: 'October',   days: 31 },
  { name: 'November',  days: 30 }, { name: 'December',  days: 31 },
];

// ── component ─────────────────────────────────────────────────────────────────

export default function CircularCalendar({
  today, events, fullMoons, zodiacSigns,
  selectedEventId, onEventClick, onTodayClick,
}: CircularCalendarProps) {
  const year       = today.getFullYear();
  const daysInYear = getDaysInYear(year);
  const todayDOY   = getDayOfYear(today);
  const todayAngle = dayToAngle(todayDOY, daysInYear);

  const leapOffset = daysInYear === 366 ? 1 : 0;
  let running = 1;
  const months = MONTHS.map((m, i) => {
    const days = i === 1 ? m.days + leapOffset : m.days;
    const start = running;
    running += days;
    return { ...m, days, start, end: running - 1 };
  });

  // Deduplicate Capricorn (appears at start and end of year in the data)
  const uniqueSigns = zodiacSigns.filter((s, i) =>
    i === 0 || s.name !== zodiacSigns[0].name
  );

  // ── element colored arcs ──────────────────────────────────────────────────

  const renderElementArcs = useCallback(() =>
    uniqueSigns.map((sign, i) => {
      const a1 = dayToAngle(sign.startDay, daysInYear);
      const a2 = dayToAngle(Math.min(sign.endDay, daysInYear) + 1, daysInYear);
      return (
        <path key={`arc-${i}`}
          d={arcPath(R.outerRing, a1, a2)}
          fill="none"
          stroke={ELEMENT_COLOR[sign.element]}
          strokeWidth="3"
          strokeLinecap="butt"
        />
      );
    }),
  [uniqueSigns, daysInYear]);

  // ── month dividers + labels ───────────────────────────────────────────────

  const renderMonths = useCallback(() =>
    months.map((m) => {
      const angle  = dayToAngle(m.start, daysInYear);
      const midA   = dayToAngle(m.start + m.days / 2, daysInYear);
      const tick0  = polar(R.outerRing - 6, angle);
      const tick1  = polar(R.outerRing + 6, angle);
      const isRight = midA < 180;
      const lp     = polar(R.outerRing + 16, midA);

      return (
        <g key={m.name}>
          <line x1={tick0.x} y1={tick0.y} x2={tick1.x} y2={tick1.y}
            stroke={INK_LIGHT} strokeWidth="0.8" />
          <text
            x={lp.x} y={lp.y + 4}
            textAnchor={isRight ? 'start' : 'end'}
            fontSize="11" fill={INK_MID}
            style={{ fontFamily: SANS, userSelect: 'none' }}
          >
            {m.name}
          </text>
        </g>
      );
    }),
  [months, daysInYear]);

  // ── season markers ────────────────────────────────────────────────────────

  const renderSeasons = useCallback(() =>
    SEASONS.map(({ label, date, approxDay }) => {
      const angle   = dayToAngle(approxDay, daysInYear);
      const isRight = angle < 180;
      const p0      = polar(R.outerRing - 4, angle);
      const p1      = polar(R.outerRing + 4, angle);
      const lp      = polar(R.outerRing + 36, angle);
      return (
        <g key={label}>
          <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y}
            stroke={INK_MID} strokeWidth="1" strokeDasharray="3 2" />
          <text x={lp.x} y={lp.y}
            textAnchor={isRight ? 'start' : 'end'}
            fontSize="9.5" fill={INK_MID}
            style={{ fontFamily: SANS, userSelect: 'none' }}>
            {label}
          </text>
          <text x={lp.x} y={lp.y + 12}
            textAnchor={isRight ? 'start' : 'end'}
            fontSize="9" fill={INK_LIGHT}
            style={{ fontFamily: SANS, userSelect: 'none' }}>
            {date}
          </text>
        </g>
      );
    }),
  [daysInYear]);

  // ── full moon circles + labels ────────────────────────────────────────────

  const renderFullMoons = useCallback(() =>
    fullMoons
      .filter((m) => new Date(m.date).getFullYear() === year)
      .map((moon) => {
        const doy     = getDayOfYear(new Date(moon.date));
        const angle   = dayToAngle(doy, daysInYear);
        const pos     = polar(R.moonDotR, angle);
        const isRight = angle < 180;
        const lp      = polar(R.moonDotR + 14, angle);
        const dateStr = new Date(moon.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return (
          <g key={moon.name + moon.date}>
            {/* White ring behind the dot so it sits cleanly on the arc */}
            <circle cx={pos.x} cy={pos.y} r={7} fill={CREAM} />
            <circle cx={pos.x} cy={pos.y} r={5} fill={MOON_BLUE} />
            <text x={lp.x} y={lp.y - 3}
              textAnchor={isRight ? 'start' : 'end'}
              fontSize="9.5" fontWeight="500" fill={INK}
              style={{ fontFamily: SANS, userSelect: 'none' }}>
              {moon.name}
            </text>
            <text x={lp.x} y={lp.y + 9}
              textAnchor={isRight ? 'start' : 'end'}
              fontSize="8.5" fill={INK_LIGHT}
              style={{ fontFamily: SANS, userSelect: 'none' }}>
              {dateStr}
            </text>
          </g>
        );
      }),
  [fullMoons, year, daysInYear]);

  // ── zodiac text labels outside the ring ───────────────────────────────────
  // Labels are always horizontal. For right-half signs, text starts at the ring
  // edge and extends right. For left-half, text ends at the ring edge (end-anchor).

  const renderZodiacLabels = useCallback(() => {
    const seen = new Set<string>();
    return uniqueSigns.map((sign, i) => {
      // Skip second occurrence of same name (Capricorn)
      if (seen.has(sign.name)) return null;
      seen.add(sign.name);

      const a1  = dayToAngle(sign.startDay, daysInYear);
      const a2  = dayToAngle(Math.min(sign.endDay, daysInYear) + 1, daysInYear);
      let midA  = (a1 + a2) / 2;
      // Wrap midAngle into 0-360
      if (midA < 0)   midA += 360;
      if (midA >= 360) midA -= 360;

      const isRight = midA < 180;
      const GAP     = 52; // px gap from ring to label start/end
      const lp      = polar(R.outerRing + GAP, midA);
      const anchor  = isRight ? 'start' : 'end';
      const lh      = 13.5;

      const dateRange   = `${doyToLabel(sign.startDay, year)} → ${doyToLabel(Math.min(sign.endDay, daysInYear), year)}`;
      const elementLine = `${sign.element.charAt(0).toUpperCase() + sign.element.slice(1)} · ${sign.planet} · ${sign.tarot}`;
      const bestFor     = BEST_FOR[sign.name] ?? '';

      return (
        <g key={`zlabel-${i}`} style={{ userSelect: 'none' }}>
          {/* Thin leader line from ring to label */}
          <line
            x1={polar(R.outerRing + 4, midA).x}
            y1={polar(R.outerRing + 4, midA).y}
            x2={polar(R.outerRing + GAP - 6, midA).x}
            y2={polar(R.outerRing + GAP - 6, midA).y}
            stroke={INK_LIGHT} strokeWidth="0.6"
          />
          {/* Sign name */}
          <text x={lp.x} y={lp.y}
            textAnchor={anchor} fontSize="11" fontWeight="500" fill={INK}
            style={{ fontFamily: SANS }}>
            {sign.name}
          </text>
          {/* Date range */}
          <text x={lp.x} y={lp.y + lh}
            textAnchor={anchor} fontSize="9.5" fill={INK_MID}
            style={{ fontFamily: SANS }}>
            {dateRange}
          </text>
          {/* Element · planet · tarot */}
          <text x={lp.x} y={lp.y + lh * 2}
            textAnchor={anchor} fontSize="9" fill={INK_LIGHT}
            style={{ fontFamily: SANS }}>
            {elementLine}
          </text>
          {/* Best for */}
          <text x={lp.x} y={lp.y + lh * 3}
            textAnchor={anchor} fontSize="9" fill={INK_LIGHT} fontStyle="italic"
            style={{ fontFamily: SERIF }}>
            {bestFor}
          </text>
        </g>
      );
    });
  }, [uniqueSigns, daysInYear, year]);

  // ── user events ───────────────────────────────────────────────────────────

  const renderEvents = useCallback(() =>
    events.map((event) => {
      const d = new Date(event.date);
      if (d.getFullYear() !== year) return null;
      const doy    = getDayOfYear(d);
      const angle  = dayToAngle(doy, daysInYear);
      const pos    = polar(R.eventRing, angle);
      const active = selectedEventId === event.id;
      const color  = event.color ?? '#6B7280';
      return (
        <g key={event.id} style={{ cursor: 'pointer' }} onClick={() => onEventClick?.(event)}>
          {active && <circle cx={pos.x} cy={pos.y} r={9} fill={color} opacity="0.18" />}
          <circle cx={pos.x} cy={pos.y} r={active ? 5.5 : 4}
            fill={color} stroke={CREAM} strokeWidth="1.5"
            style={{ transition: 'r 0.15s' }}>
            <title>{event.title} — {new Date(event.date).toLocaleDateString()}</title>
          </circle>
        </g>
      );
    }),
  [events, year, daysInYear, selectedEventId, onEventClick]);

  // ── today indicator ───────────────────────────────────────────────────────

  const renderToday = useCallback(() => {
    const tip   = polar(R.todayLine, todayAngle);
    const start = polar(R.innerCircle + 8, todayAngle);
    return (
      <g style={{ cursor: 'pointer' }} onClick={onTodayClick}>
        <line x1={start.x} y1={start.y} x2={tip.x} y2={tip.y}
          stroke={INK} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
        <circle cx={CX} cy={CY} r={R.innerCircle}
          fill={CREAM} stroke="hsl(35,10%,84%)" strokeWidth="1" />
        {/* Gold sun circle */}
        <circle cx={CX} cy={CY} r={14} fill="#D4A843" opacity="0.9" />
        {/* Date number */}
        <text x={CX} y={CY + 5} textAnchor="middle" dominantBaseline="middle"
          fontSize="14" fill={CREAM} fontWeight="500"
          style={{ fontFamily: SANS, userSelect: 'none' }}>
          {today.getDate()}
        </text>
      </g>
    );
  }, [todayAngle, today, onTodayClick]);

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <svg
      viewBox="0 0 900 900"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', display: 'block' }}
      aria-label={`Circular calendar for ${year}`}
    >
      {/* Page-colored fill behind the whole chart */}
      <rect width="900" height="900" fill={CREAM} />

      {/* Subtle background disc */}
      <circle cx={CX} cy={CY} r={R.outerRing + 2} fill="white" opacity="0.4" />

      {/* Base ring */}
      <circle cx={CX} cy={CY} r={R.outerRing}
        fill="none" stroke="hsl(35,10%,84%)" strokeWidth="0.8" />

      {/* Element-colored arcs on top of the ring */}
      {renderElementArcs()}

      {/* Inner dashed guide ring */}
      <circle cx={CX} cy={CY} r={R.eventRing}
        fill="none" stroke="hsl(215,10%,88%)" strokeWidth="0.5" strokeDasharray="2 5" />

      {/* Labels */}
      {renderMonths()}
      {renderSeasons()}
      {renderFullMoons()}
      {renderZodiacLabels()}
      {renderEvents()}
      {renderToday()}
    </svg>
  );
}
