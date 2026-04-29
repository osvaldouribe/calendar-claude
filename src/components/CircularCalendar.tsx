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

const CX = 300;
const CY = 300;

function polarToCartesian(r: number, angleDeg: number, cx = CX, cy = CY) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function dayToAngle(day: number, daysInYear: number): number {
  return ((day - 1) / daysInYear) * 360;
}

function sectorPath(r1: number, r2: number, startAngle: number, endAngle: number): string {
  const s1 = polarToCartesian(r1, startAngle);
  const e1 = polarToCartesian(r1, endAngle);
  const s2 = polarToCartesian(r2, startAngle);
  const e2 = polarToCartesian(r2, endAngle);
  const delta = ((endAngle - startAngle) + 360) % 360;
  const large = delta > 180 ? 1 : 0;
  return [
    `M ${s1.x.toFixed(2)} ${s1.y.toFixed(2)}`,
    `A ${r1} ${r1} 0 ${large} 1 ${e1.x.toFixed(2)} ${e1.y.toFixed(2)}`,
    `L ${e2.x.toFixed(2)} ${e2.y.toFixed(2)}`,
    `A ${r2} ${r2} 0 ${large} 0 ${s2.x.toFixed(2)} ${s2.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

const ELEMENT_FILL: Record<string, string> = {
  fire:  'hsl(28, 55%, 93%)',
  earth: 'hsl(100, 22%, 91%)',
  air:   'hsl(205, 35%, 92%)',
  water: 'hsl(220, 35%, 92%)',
};

const ELEMENT_STROKE: Record<string, string> = {
  fire:  'hsl(28, 45%, 68%)',
  earth: 'hsl(105, 28%, 55%)',
  air:   'hsl(207, 40%, 58%)',
  water: 'hsl(222, 38%, 58%)',
};

const MONTHS = [
  { name: 'JAN', days: 31 }, { name: 'FEB', days: 28 },
  { name: 'MAR', days: 31 }, { name: 'APR', days: 30 },
  { name: 'MAY', days: 31 }, { name: 'JUN', days: 30 },
  { name: 'JUL', days: 31 }, { name: 'AUG', days: 31 },
  { name: 'SEP', days: 30 }, { name: 'OCT', days: 31 },
  { name: 'NOV', days: 30 }, { name: 'DEC', days: 31 },
];

const R = {
  labelOuter:  264,
  outerRing:   252,
  zodiacOut:   236,
  zodiacIn:    206,
  moonRing:    192,
  eventRing:   176,
  todayLine:   163,
  innerCircle:  84,
} as const;

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
    const startDay = running;
    running += days;
    return { ...m, days, startDay, endDay: running - 1 };
  });

  const renderZodiacSegments = useCallback(() =>
    zodiacSigns.map((sign, i) => {
      const startAngle = dayToAngle(sign.startDay, daysInYear);
      const endDay     = Math.min(sign.endDay, daysInYear);
      const endAngle   = dayToAngle(endDay + 1, daysInYear);
      const midAngle   = (startAngle + endAngle) / 2;
      const labelPos   = polarToCartesian((R.zodiacOut + R.zodiacIn) / 2, midAngle);

      return (
        <g key={`zodiac-${i}`}>
          <path
            d={sectorPath(R.zodiacIn, R.zodiacOut, startAngle, endAngle)}
            fill={ELEMENT_FILL[sign.element]}
            stroke={ELEMENT_STROKE[sign.element]}
            strokeWidth="0.4"
            opacity="0.75"
          />
          {endAngle - startAngle > 12 && (
            <text
              x={labelPos.x} y={labelPos.y}
              textAnchor="middle" dominantBaseline="central"
              fontSize="10" fill="#666"
              style={{ fontFamily: 'serif', userSelect: 'none' }}
            >
              {sign.symbol}
            </text>
          )}
        </g>
      );
    }),
  [zodiacSigns, daysInYear]);

  const renderMonthGrid = useCallback(() =>
    months.map((m) => {
      const startAngle  = dayToAngle(m.startDay, daysInYear);
      const midAngle    = dayToAngle(m.startDay + m.days / 2, daysInYear);
      const tickOuter   = polarToCartesian(R.outerRing, startAngle);
      const tickInner   = polarToCartesian(R.zodiacOut, startAngle);
      const labelPos    = polarToCartesian(R.labelOuter, midAngle);
      const textRotation = midAngle <= 180 ? midAngle - 90 : midAngle + 90;

      return (
        <g key={m.name}>
          <line
            x1={tickInner.x} y1={tickInner.y}
            x2={tickOuter.x} y2={tickOuter.y}
            stroke="#C8C4BC" strokeWidth="0.6"
          />
          <text
            x={labelPos.x} y={labelPos.y}
            textAnchor="middle" dominantBaseline="central"
            fontSize="6.5" letterSpacing="0.1em" fill="#A09890"
            transform={`rotate(${textRotation}, ${labelPos.x}, ${labelPos.y})`}
            style={{ fontFamily: "'DM Sans', system-ui, sans-serif", userSelect: 'none' }}
          >
            {m.name}
          </text>
        </g>
      );
    }),
  [months, daysInYear]);

  const renderSeasonMarkers = useCallback(() => {
    const markers = [
      { label: '♈', approxDay: 80  },
      { label: '♋', approxDay: 172 },
      { label: '♎', approxDay: 265 },
      { label: '♑', approxDay: 355 },
    ];
    return markers.map(({ label, approxDay }) => {
      const angle = dayToAngle(approxDay, daysInYear);
      const inner = polarToCartesian(R.zodiacIn - 2, angle);
      const outer = polarToCartesian(R.outerRing + 4, angle);
      const lbl   = polarToCartesian(R.outerRing + 14, angle);
      return (
        <g key={label}>
          <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
            stroke="hsl(35, 25%, 70%)" strokeWidth="0.8" strokeDasharray="2.5 2" />
          <text x={lbl.x} y={lbl.y} textAnchor="middle" dominantBaseline="central"
            fontSize="7.5" fill="hsl(35, 25%, 65%)"
            style={{ fontFamily: 'serif', userSelect: 'none' }}>
            {label}
          </text>
        </g>
      );
    });
  }, [daysInYear]);

  const renderFullMoons = useCallback(() =>
    fullMoons
      .filter((m) => new Date(m.date).getFullYear() === year)
      .map((moon) => {
        const doy = getDayOfYear(new Date(moon.date));
        const angle = dayToAngle(doy, daysInYear);
        const pos = polarToCartesian(R.moonRing, angle);
        return (
          <g key={moon.name + moon.date}>
            <circle cx={pos.x} cy={pos.y} r={3.5}
              fill="none" stroke="hsl(35, 35%, 66%)" strokeWidth="1.2" />
            <circle cx={pos.x} cy={pos.y} r={0.8} fill="hsl(35, 35%, 66%)" />
          </g>
        );
      }),
  [fullMoons, year, daysInYear]);

  const renderEvents = useCallback(() =>
    events.map((event) => {
      const d = new Date(event.date);
      if (d.getFullYear() !== year) return null;
      const doy      = getDayOfYear(d);
      const angle    = dayToAngle(doy, daysInYear);
      const pos      = polarToCartesian(R.eventRing, angle);
      const isActive = selectedEventId === event.id;
      const color    = event.color ?? '#6B7280';
      return (
        <g key={event.id} className="cursor-pointer" onClick={() => onEventClick?.(event)}>
          {isActive && (
            <circle cx={pos.x} cy={pos.y} r={8} fill={color} opacity="0.2" />
          )}
          <circle
            cx={pos.x} cy={pos.y} r={isActive ? 5 : 3.5}
            fill={color} stroke="white" strokeWidth="1.2"
            style={{ transition: 'r 0.15s ease' }}
          >
            <title>{event.title} — {new Date(event.date).toLocaleDateString()}</title>
          </circle>
        </g>
      );
    }),
  [events, year, daysInYear, selectedEventId, onEventClick]);

  const renderTodayIndicator = useCallback(() => {
    const tipPos    = polarToCartesian(R.todayLine + 14, todayAngle);
    const lineEnd   = polarToCartesian(R.todayLine, todayAngle);
    const lineStart = polarToCartesian(R.innerCircle + 6, todayAngle);
    return (
      <g className="cursor-pointer" onClick={onTodayClick}>
        <circle cx={tipPos.x} cy={tipPos.y} r={7}
          fill="hsl(215, 18%, 20%)" opacity="0.12" />
        <line
          x1={lineStart.x} y1={lineStart.y} x2={lineEnd.x} y2={lineEnd.y}
          stroke="hsl(215, 18%, 20%)" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx={tipPos.x} cy={tipPos.y} r={4.5} fill="hsl(215, 18%, 20%)" />
      </g>
    );
  }, [todayAngle, onTodayClick]);

  return (
    <svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full" style={{ maxWidth: '600px', maxHeight: '600px' }}
      aria-label={`Circular calendar for ${year}`}>

      <circle cx={CX} cy={CY} r={R.outerRing + 30} fill="hsl(40, 20%, 98%)" />
      <circle cx={CX} cy={CY} r={R.outerRing}
        fill="none" stroke="hsl(35, 15%, 85%)" strokeWidth="0.6" />

      {renderZodiacSegments()}

      <circle cx={CX} cy={CY} r={R.zodiacOut}
        fill="none" stroke="hsl(35, 12%, 82%)" strokeWidth="0.5" />
      <circle cx={CX} cy={CY} r={R.zodiacIn}
        fill="none" stroke="hsl(35, 12%, 82%)" strokeWidth="0.5" />

      {renderMonthGrid()}
      {renderSeasonMarkers()}

      <circle cx={CX} cy={CY} r={R.moonRing}
        fill="none" stroke="hsl(35, 15%, 88%)" strokeWidth="0.4" strokeDasharray="1 4" />
      {renderFullMoons()}

      <circle cx={CX} cy={CY} r={R.eventRing}
        fill="none" stroke="hsl(215, 15%, 88%)" strokeWidth="0.4" strokeDasharray="1 4" />
      {renderEvents()}

      {renderTodayIndicator()}

      <circle cx={CX} cy={CY} r={R.innerCircle}
        fill="hsl(40, 20%, 98%)" stroke="hsl(35, 12%, 88%)" strokeWidth="0.8" />

      <text x={CX} y={CY - 22} textAnchor="middle"
        fontSize="9" letterSpacing="0.18em" fill="hsl(215, 8%, 60%)"
        style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 400 }}>
        {year}
      </text>
      <text x={CX} y={CY + 8} textAnchor="middle"
        fontSize="30" fill="hsl(215, 18%, 20%)"
        style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 300 }}>
        {today.getDate()}
      </text>
      <text x={CX} y={CY + 26} textAnchor="middle"
        fontSize="8" letterSpacing="0.18em" fill="hsl(215, 8%, 60%)"
        style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 400 }}>
        {today.toLocaleString('default', { month: 'long' }).toUpperCase()}
      </text>
    </svg>
  );
}