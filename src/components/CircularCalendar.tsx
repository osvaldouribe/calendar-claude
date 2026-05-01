'use client';

import React, { useCallback, useState, useRef } from 'react';
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

// ── geometry ─────────────────────────────────────────────────────────────────
const CX = 300;
const CY = 300;

const R = {
  outer:       255,   // main ring — element arcs drawn here
  zodiacOuter: 238,   // zodiac band outer edge (for fills + hit area)
  zodiacInner: 208,   // zodiac band inner edge
  moonDot:     255,   // full moon circles sit on the outer ring
  eventRing:   180,
  inner:        76,   // cream center disc
} as const;

function polar(r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function dayToAngle(day: number, total: number) {
  return ((day - 1) / total) * 360;
}

function arcPath(r: number, a1: number, a2: number): string {
  const s = polar(r, a1), e = polar(r, a2);
  const span = ((a2 - a1) + 360) % 360;
  return `M${s.x.toFixed(1)},${s.y.toFixed(1)} A${r},${r} 0 ${span > 180 ? 1 : 0},1 ${e.x.toFixed(1)},${e.y.toFixed(1)}`;
}

function sectorPath(r1: number, r2: number, a1: number, a2: number): string {
  const s1 = polar(r1, a1), e1 = polar(r1, a2);
  const s2 = polar(r2, a1), e2 = polar(r2, a2);
  const span = ((a2 - a1) + 360) % 360;
  const lg = span > 180 ? 1 : 0;
  return [
    `M${s1.x.toFixed(1)},${s1.y.toFixed(1)}`,
    `A${r1},${r1} 0 ${lg},1 ${e1.x.toFixed(1)},${e1.y.toFixed(1)}`,
    `L${e2.x.toFixed(1)},${e2.y.toFixed(1)}`,
    `A${r2},${r2} 0 ${lg},0 ${s2.x.toFixed(1)},${s2.y.toFixed(1)}`,
    'Z',
  ].join(' ');
}

function doyToLabel(doy: number, year: number) {
  return new Date(year, 0, doy).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── tokens ───────────────────────────────────────────────────────────────────
const ELEMENT_COLOR: Record<string, string> = {
  fire:  '#C8673A',  // orange
  earth: '#6A9B52',  // green
  air:   '#4CA8C8',  // cyan-blue
  water: '#6B50A8',  // indigo-violet
};

const ELEMENT_FILL: Record<string, string> = {
  fire:  'rgba(200, 103, 58,  0.07)',
  earth: 'rgba(106, 155, 82,  0.07)',
  air:   'rgba(76,  168, 200, 0.07)',
  water: 'rgba(107, 80,  168, 0.07)',
};

const MOON_COLOR = '#4CA8C8';
const CREAM      = '#F7F5F0';
const INK        = '#1C1917';
const INK_MID    = '#6B6560';
const INK_LIGHT  = '#A8A29E';
const INTER      = "'Inter', system-ui, sans-serif";

const MONTHS = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec',
];
const MONTH_DAYS = [31,28,31,30,31,30,31,31,30,31,30,31];

// ── tooltip ───────────────────────────────────────────────────────────────────
interface Tip {
  x: number; y: number;
  title: string;
  meta?: string;
  rows: { label: string; value: string }[];
  note?: string;
}

// ── component ─────────────────────────────────────────────────────────────────
export default function CircularCalendar({
  today, events, fullMoons, zodiacSigns,
  selectedEventId, onEventClick, onTodayClick,
}: CircularCalendarProps) {
  const year       = today.getFullYear();
  const daysInYear = getDaysInYear(year);
  const todayDOY   = getDayOfYear(today);
  const todayAngle = dayToAngle(todayDOY, daysInYear);

  const wrapRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<Tip | null>(null);

  const leapOffset = daysInYear === 366 ? 1 : 0;
  let running = 1;
  const months = MONTH_DAYS.map((d, i) => {
    const days = i === 1 ? d + leapOffset : d;
    const start = running;
    running += days;
    return { name: MONTHS[i], days, start };
  });

  // deduplicate Capricorn that spans year-end/start
  const uniqueSigns = zodiacSigns.filter((s, i) =>
    i === 0 || s.name !== zodiacSigns[0].name
  );

  // mouse helpers
  const pos = useCallback((e: React.MouseEvent): { x: number; y: number } => {
    const r = wrapRef.current?.getBoundingClientRect();
    return r ? { x: e.clientX - r.left, y: e.clientY - r.top } : { x: 0, y: 0 };
  }, []);
  const move  = useCallback((e: React.MouseEvent) => setTip(t => t ? { ...t, ...pos(e) } : null), [pos]);
  const clear = useCallback(() => setTip(null), []);

  // ── renderers ────────────────────────────────────────────────────────────

  const renderZodiac = useCallback(() =>
    uniqueSigns.map((sign, i) => {
      const a1 = dayToAngle(sign.startDay, daysInYear);
      const a2 = dayToAngle(Math.min(sign.endDay, daysInYear) + 1, daysInYear);
      return (
        <g key={`z${i}`}
          onMouseEnter={(e) => setTip({
            ...pos(e),
            title: sign.name,
            meta: `${sign.element.charAt(0).toUpperCase() + sign.element.slice(1)} · ${sign.planet}`,
            rows: [
              { label: 'Dates',  value: `${doyToLabel(sign.startDay, year)} – ${doyToLabel(Math.min(sign.endDay, daysInYear), year)}` },
              { label: 'Tarot',  value: sign.tarot },
            ],
            note: sign.energyDescription,
          })}
          onMouseMove={move}
          onMouseLeave={clear}
          style={{ cursor: 'default' }}
        >
          {/* Subtle fill */}
          <path d={sectorPath(R.zodiacInner, R.zodiacOuter, a1, a2)}
            fill={ELEMENT_FILL[sign.element]} stroke="none" />
          {/* Colored arc on the outer ring */}
          <path d={arcPath(R.outer, a1, a2)}
            fill="none" stroke={ELEMENT_COLOR[sign.element]} strokeWidth="3" strokeLinecap="butt" />
        </g>
      );
    }),
  [uniqueSigns, daysInYear, year, pos, move, clear]);

  const renderMonths = useCallback(() =>
    months.map((m, i) => {
      const a = dayToAngle(m.start, daysInYear);
      const midA = dayToAngle(m.start + m.days / 2, daysInYear);
      const t0 = polar(R.outer - 5, a);
      const t1 = polar(R.outer + 5, a);
      const isRight = midA < 180;
      const lp = polar(R.outer + 14, midA);
      return (
        <g key={`m${i}`}>
          <line x1={t0.x} y1={t0.y} x2={t1.x} y2={t1.y}
            stroke={INK_LIGHT} strokeWidth="0.8" />
          <text x={lp.x} y={lp.y + 4}
            textAnchor={isRight ? 'start' : 'end'}
            fontSize="7.5" fill={INK_LIGHT}
            style={{ fontFamily: INTER, userSelect: 'none' }}>
            {m.name}
          </text>
        </g>
      );
    }),
  [months, daysInYear]);

  const renderMoons = useCallback(() =>
    fullMoons
      .filter(m => new Date(m.date).getFullYear() === year)
      .map((moon) => {
        const doy  = getDayOfYear(new Date(moon.date));
        const a    = dayToAngle(doy, daysInYear);
        const p    = polar(R.moonDot, a);
        const dateStr = new Date(moon.date).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
        });
        return (
          <g key={moon.name + moon.date}
            onMouseEnter={(e) => setTip({
              ...pos(e),
              title: moon.name,
              rows: [{ label: 'Date', value: dateStr }],
              note: moon.description,
            })}
            onMouseMove={move}
            onMouseLeave={clear}
            style={{ cursor: 'default' }}
          >
            <circle cx={p.x} cy={p.y} r={9} fill="transparent" />
            <circle cx={p.x} cy={p.y} r={6} fill={CREAM} />
            <circle cx={p.x} cy={p.y} r={4.5} fill={MOON_COLOR} />
          </g>
        );
      }),
  [fullMoons, year, daysInYear, pos, move, clear]);

  const EVENT_COLOR = ELEMENT_COLOR.water; // #6B50A8 — palette purple

  const renderEvents = useCallback(() =>
    events.map((ev) => {
      const d = new Date(ev.date);
      if (d.getFullYear() !== year) return null;
      const a = dayToAngle(getDayOfYear(d), daysInYear);
      const p = polar(R.eventRing, a);
      const active = selectedEventId === ev.id;
      const dateStr = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      return (
        <g key={ev.id} style={{ cursor: 'pointer' }}
          onClick={() => onEventClick?.(ev)}
          onMouseEnter={(e) => setTip({
            ...pos(e),
            title: ev.title,
            rows: [{ label: 'Date', value: dateStr }],
            note: ev.description ?? undefined,
          })}
          onMouseMove={move}
          onMouseLeave={clear}
        >
          {active && <circle cx={p.x} cy={p.y} r={10} fill={EVENT_COLOR} opacity="0.15" />}
          <circle cx={p.x} cy={p.y} r={active ? 5.5 : 4}
            fill={EVENT_COLOR} stroke={CREAM} strokeWidth="1.5"
            style={{ transition: 'r 0.15s' }} />
        </g>
      );
    }),
  [events, year, daysInYear, selectedEventId, onEventClick, EVENT_COLOR, pos, move, clear]);

  const renderToday = useCallback(() => {
    const tip_ = polar(R.outer, todayAngle);
    const base = polar(R.inner + 8, todayAngle);
    return (
      <g style={{ cursor: 'pointer' }} onClick={onTodayClick}>
        <line x1={base.x} y1={base.y} x2={tip_.x} y2={tip_.y}
          stroke={INK} strokeWidth="1" strokeLinecap="round" opacity="0.35" />
        <circle cx={CX} cy={CY} r={R.inner} fill={CREAM} stroke="hsl(35,10%,86%)" strokeWidth="0.8" />
        <circle cx={CX} cy={CY} r={13} fill="#D4A843" />
        <text x={CX} y={CY + 1} textAnchor="middle" dominantBaseline="middle"
          fontSize="11" fontWeight="600" fill={CREAM}
          style={{ fontFamily: INTER, userSelect: 'none' }}>
          {today.getDate()}
        </text>
      </g>
    );
  }, [todayAngle, today, onTodayClick]);

  // tooltip smart flip
  const containerW = wrapRef.current?.offsetWidth ?? 400;
  const flipX = tip ? tip.x > containerW * 0.58 : false;

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 600 600"
        style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}
        aria-label={`Circular calendar ${year}`}>

        <circle cx={CX} cy={CY} r={R.outer + 2} fill={CREAM} />

        {/* Base ring */}
        <circle cx={CX} cy={CY} r={R.outer}
          fill="none" stroke="hsl(35,12%,84%)" strokeWidth="0.6" />

        {/* Zodiac: fills + colored arcs */}
        {renderZodiac()}

        {/* Inner guide ring */}
        <circle cx={CX} cy={CY} r={R.zodiacInner}
          fill="none" stroke="hsl(35,10%,88%)" strokeWidth="0.5" />

        {/* Event dashed ring */}
        <circle cx={CX} cy={CY} r={R.eventRing}
          fill="none" stroke="hsl(215,10%,90%)" strokeWidth="0.4" strokeDasharray="2 5" />

        {renderMonths()}
        {renderMoons()}
        {renderEvents()}
        {renderToday()}
      </svg>

      {/* Tooltip */}
      {tip && (
        <div style={{
          position: 'absolute',
          top: tip.y - 8,
          left: flipX ? tip.x - 12 : tip.x + 12,
          transform: flipX ? 'translateX(-100%)' : 'none',
          background: INK,
          color: '#F7F5F0',
          borderRadius: '8px',
          padding: '12px 14px',
          pointerEvents: 'none',
          zIndex: 30,
          maxWidth: '220px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
          fontFamily: INTER,
        }}>
          <p style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 2px', color: '#F7F5F0' }}>
            {tip.title}
          </p>
          {tip.meta && (
            <p style={{ fontSize: '11px', color: '#78716C', margin: '0 0 8px' }}>
              {tip.meta}
            </p>
          )}
          {tip.rows.map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', gap: '8px', marginTop: '4px',
              fontSize: '11px', alignItems: 'baseline' }}>
              <span style={{ color: '#6B6560', minWidth: '36px', flexShrink: 0 }}>
                {label}
              </span>
              <span style={{ color: '#D6D3CE' }}>{value}</span>
            </div>
          ))}
          {tip.note && (
            <p style={{ fontSize: '11px', lineHeight: 1.55,
              color: '#9C9792', margin: '8px 0 0', borderTop: '1px solid #2C2A28',
              paddingTop: '8px' }}>
              {tip.note}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
