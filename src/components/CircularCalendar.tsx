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

// ── geometry helpers ────────────────────────────────────────────────────────

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

function dayOfYearToDate(doy: number, year: number): string {
  const d = new Date(year, 0, doy);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── color tokens ─────────────────────────────────────────────────────────────

const ELEMENT_FILL: Record<string, string> = {
  fire:  'hsl(28, 28%, 96%)',
  earth: 'hsl(88, 14%, 95%)',
  air:   'hsl(208, 20%, 95%)',
  water: 'hsl(222, 22%, 95%)',
};
const ELEMENT_STROKE: Record<string, string> = {
  fire:  'hsl(28, 20%, 87%)',
  earth: 'hsl(88, 12%, 87%)',
  air:   'hsl(208, 18%, 87%)',
  water: 'hsl(222, 20%, 87%)',
};

const ELEMENT_LABEL: Record<string, string> = {
  fire: 'Fire', earth: 'Earth', air: 'Air', water: 'Water',
};

// ── static data ───────────────────────────────────────────────────────────────

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

const SANS: React.CSSProperties  = { fontFamily: "'DM Sans', system-ui, sans-serif", userSelect: 'none' };
const SERIF: React.CSSProperties = { fontFamily: "'DM Serif Display', Georgia, serif", userSelect: 'none' };

// ── tooltip types ─────────────────────────────────────────────────────────────

interface TooltipState {
  x: number;
  y: number;
  title: string;
  subtitle?: string;
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

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const leapOffset = daysInYear === 366 ? 1 : 0;
  let running = 1;
  const months = MONTHS.map((m, i) => {
    const days = i === 1 ? m.days + leapOffset : m.days;
    const startDay = running;
    running += days;
    return { ...m, days, startDay, endDay: running - 1 };
  });

  // ── tooltip helpers ──────────────────────────────────────────────────────

  const posFromEvent = useCallback((e: React.MouseEvent): { x: number; y: number } => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    return rect
      ? { x: e.clientX - rect.left, y: e.clientY - rect.top }
      : { x: e.clientX, y: e.clientY };
  }, []);

  const trackMouse = useCallback((e: React.MouseEvent) => {
    setTooltip(prev => prev ? { ...prev, ...posFromEvent(e) } : null);
  }, [posFromEvent]);

  const hide = useCallback(() => setTooltip(null), []);

  // ── renderers ────────────────────────────────────────────────────────────

  const renderZodiacSegments = useCallback(() =>
    zodiacSigns.map((sign, i) => {
      const startAngle = dayToAngle(sign.startDay, daysInYear);
      const endDay     = Math.min(sign.endDay, daysInYear);
      const endAngle   = dayToAngle(endDay + 1, daysInYear);
      const midAngle   = (startAngle + endAngle) / 2;
      const labelPos   = polarToCartesian((R.zodiacOut + R.zodiacIn) / 2, midAngle);

      return (
        <g
          key={`zodiac-${i}`}
          style={{ cursor: 'default' }}
          onMouseEnter={(e) => setTooltip({
            ...posFromEvent(e),
            title: `${sign.name} ${sign.symbol}`,
            subtitle: `${ELEMENT_LABEL[sign.element]} · ${sign.planet}`,
            rows: [
              { label: 'Dates',  value: `${dayOfYearToDate(sign.startDay, year)} – ${dayOfYearToDate(endDay, year)}` },
              { label: 'Tarot',  value: sign.tarot },
            ],
            note: sign.energyDescription,
          })}
          onMouseMove={trackMouse}
          onMouseLeave={hide}
        >
          <path
            d={sectorPath(R.zodiacIn, R.zodiacOut, startAngle, endAngle)}
            fill={ELEMENT_FILL[sign.element]}
            stroke={ELEMENT_STROKE[sign.element]}
            strokeWidth="0.5"
          />
          {endAngle - startAngle > 12 && (
            <text
              x={labelPos.x} y={labelPos.y}
              textAnchor="middle" dominantBaseline="central"
              fontSize="10" fill="hsl(30, 10%, 62%)"
              style={SERIF}
            >
              {sign.symbol}
            </text>
          )}
        </g>
      );
    }),
  [zodiacSigns, daysInYear, year, posFromEvent, trackMouse, hide]);

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
            stroke="hsl(35, 12%, 80%)" strokeWidth="0.7"
          />
          <text
            x={labelPos.x} y={labelPos.y}
            textAnchor="middle" dominantBaseline="central"
            fontSize="6.5" letterSpacing="0.12em" fill="hsl(35, 8%, 65%)"
            transform={`rotate(${textRotation}, ${labelPos.x}, ${labelPos.y})`}
            style={SANS}
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
            stroke="hsl(35, 18%, 75%)" strokeWidth="0.8" strokeDasharray="2.5 2" />
          <text x={lbl.x} y={lbl.y} textAnchor="middle" dominantBaseline="central"
            fontSize="7.5" fill="hsl(35, 18%, 68%)" style={SERIF}>
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
        const doy   = getDayOfYear(new Date(moon.date));
        const angle = dayToAngle(doy, daysInYear);
        const pos   = polarToCartesian(R.moonRing, angle);
        const dateStr = new Date(moon.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        return (
          <g
            key={moon.name + moon.date}
            style={{ cursor: 'default' }}
            onMouseEnter={(e) => setTooltip({
              ...posFromEvent(e),
              title: `${moon.name} ○`,
              rows: [{ label: 'Date', value: dateStr }],
              note: moon.description,
            })}
            onMouseMove={trackMouse}
            onMouseLeave={hide}
          >
            {/* Larger invisible hit area */}
            <circle cx={pos.x} cy={pos.y} r={9} fill="transparent" />
            <circle cx={pos.x} cy={pos.y} r={3.5}
              fill="none" stroke="hsl(35, 30%, 64%)" strokeWidth="1.1" />
            <circle cx={pos.x} cy={pos.y} r={0.8} fill="hsl(35, 30%, 64%)" />
          </g>
        );
      }),
  [fullMoons, year, daysInYear, posFromEvent, trackMouse, hide]);

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
            <circle cx={pos.x} cy={pos.y} r={8} fill={color} opacity="0.18" />
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
      <g style={{ cursor: 'pointer' }} onClick={onTodayClick}>
        <circle cx={tipPos.x} cy={tipPos.y} r={7}
          fill="hsl(215, 18%, 20%)" opacity="0.08" />
        <line
          x1={lineStart.x} y1={lineStart.y} x2={lineEnd.x} y2={lineEnd.y}
          stroke="var(--ink, #1C1917)" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx={tipPos.x} cy={tipPos.y} r={4.5} fill="var(--ink, #1C1917)" />
      </g>
    );
  }, [todayAngle, onTodayClick]);

  // ── tooltip rendering ────────────────────────────────────────────────────

  const containerW = wrapperRef.current?.offsetWidth ?? 400;
  const flipX = tooltip ? tooltip.x > containerW * 0.60 : false;

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg
        viewBox="0 0 600 600"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', display: 'block' }}
        aria-label={`Circular calendar for ${year}`}
      >
        {/* Background disc */}
        <circle cx={CX} cy={CY} r={R.outerRing + 30} fill="var(--bg-cream, #F7F5F0)" />
        <circle cx={CX} cy={CY} r={R.outerRing}
          fill="none" stroke="hsl(35, 12%, 82%)" strokeWidth="0.6" />

        {renderZodiacSegments()}

        <circle cx={CX} cy={CY} r={R.zodiacOut}
          fill="none" stroke="hsl(35, 10%, 84%)" strokeWidth="0.5" />
        <circle cx={CX} cy={CY} r={R.zodiacIn}
          fill="none" stroke="hsl(35, 10%, 84%)" strokeWidth="0.5" />

        {renderMonthGrid()}
        {renderSeasonMarkers()}

        <circle cx={CX} cy={CY} r={R.moonRing}
          fill="none" stroke="hsl(35, 15%, 85%)" strokeWidth="0.4" strokeDasharray="1 4" />
        {renderFullMoons()}

        <circle cx={CX} cy={CY} r={R.eventRing}
          fill="none" stroke="hsl(215, 10%, 86%)" strokeWidth="0.4" strokeDasharray="1 4" />
        {renderEvents()}

        {renderTodayIndicator()}

        {/* Center disc */}
        <circle cx={CX} cy={CY} r={R.innerCircle}
          fill="var(--bg-cream, #F7F5F0)" stroke="hsl(35, 10%, 86%)" strokeWidth="0.8" />
        <text x={CX} y={CY - 22} textAnchor="middle"
          fontSize="8.5" letterSpacing="0.22em" fill="hsl(35, 8%, 62%)"
          style={SANS}>
          {year}
        </text>
        <text x={CX} y={CY + 9} textAnchor="middle"
          fontSize="32" fill="var(--ink, #1C1917)"
          style={SERIF}>
          {today.getDate()}
        </text>
        <text x={CX} y={CY + 26} textAnchor="middle"
          fontSize="7.5" letterSpacing="0.22em" fill="hsl(35, 8%, 62%)"
          style={SANS}>
          {today.toLocaleString('default', { month: 'long' }).toUpperCase()}
        </text>
      </svg>

      {/* Floating tooltip */}
      {tooltip && (
        <div style={{
          position: 'absolute',
          left: flipX ? tooltip.x - 14 : tooltip.x + 14,
          top: tooltip.y - 10,
          transform: flipX ? 'translateX(-100%)' : 'none',
          background: '#1C1917',
          color: '#F7F5F0',
          padding: '12px 14px',
          borderRadius: '7px',
          pointerEvents: 'none',
          zIndex: 20,
          maxWidth: '210px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
        }}>
          <p style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: '13px', margin: '0 0 2px', lineHeight: 1.2, color: '#F7F5F0',
          }}>
            {tooltip.title}
          </p>
          {tooltip.subtitle && (
            <p style={{
              fontFamily: "'DM Sans', system-ui",
              fontSize: '9.5px', letterSpacing: '0.12em', textTransform: 'uppercase',
              color: '#9C9792', margin: '0 0 8px',
            }}>
              {tooltip.subtitle}
            </p>
          )}
          {tooltip.rows.map(({ label, value }) => (
            <div key={label} style={{
              display: 'flex', gap: '8px', alignItems: 'baseline',
              fontFamily: "'DM Sans', system-ui", fontSize: '11px',
              marginTop: tooltip.subtitle || label !== tooltip.rows[0].label ? '3px' : '8px',
            }}>
              <span style={{ color: '#6B6560', minWidth: '38px', flexShrink: 0, fontSize: '9.5px',
                letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {label}
              </span>
              <span style={{ color: '#D6D3CE' }}>{value}</span>
            </div>
          ))}
          {tooltip.note && (
            <p style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: '11px', fontStyle: 'italic', lineHeight: 1.55,
              color: '#9C9792', margin: '8px 0 0',
              borderTop: '1px solid #2C2A28', paddingTop: '8px',
            }}>
              {tooltip.note}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
