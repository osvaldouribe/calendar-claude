export type Element = 'fire' | 'earth' | 'air' | 'water';

export interface ZodiacSign {
  name: string;
  symbol: string;
  startDay: number;
  endDay: number;
  element: Element;
  planet: string;
  tarot: string;
  energyDescription: string;
}

export interface FullMoon {
  name: string;
  date: string;
  description: string;
}

export interface TodayInfo {
  zodiac: ZodiacSign;
  element: Element;
  planet: string;
  tarot: string;
  energyDescription: string;
  season: string;
  nextFullMoon: FullMoon;
}

export const ZODIAC_SIGNS: ZodiacSign[] = [
  {
    name: 'Capricorn', symbol: '♑', startDay: 1, endDay: 19,
    element: 'earth', planet: 'Saturn', tarot: 'The Devil',
    energyDescription: 'Disciplined ambition meets quiet determination. A time for building structures that last — slow, intentional, and rooted. Saturn rewards patience.',
  },
  {
    name: 'Aquarius', symbol: '♒', startDay: 20, endDay: 49,
    element: 'air', planet: 'Uranus', tarot: 'The Star',
    energyDescription: 'Electric insight and collective vision. The mind reaches beyond convention. Ideals crystallize into possibility. A time to innovate and connect.',
  },
  {
    name: 'Pisces', symbol: '♓', startDay: 50, endDay: 79,
    element: 'water', planet: 'Neptune', tarot: 'The Moon',
    energyDescription: 'The veil between worlds grows thin. Dreams carry messages. Intuition flows freely. Surrender to the rhythm beneath the surface.',
  },
  {
    name: 'Aries', symbol: '♈', startDay: 80, endDay: 109,
    element: 'fire', planet: 'Mars', tarot: 'The Emperor',
    energyDescription: 'Ignition. The first fire of spring. Initiative surges forward with raw, unstoppable momentum. Act before you overthink.',
  },
  {
    name: 'Taurus', symbol: '♉', startDay: 110, endDay: 140,
    element: 'earth', planet: 'Venus', tarot: 'The Hierophant',
    energyDescription: 'Slow down and root. Beauty lives in the tactile world — soil, bread, music, rest. Value what endures. Let Venus lead.',
  },
  {
    name: 'Gemini', symbol: '♊', startDay: 141, endDay: 171,
    element: 'air', planet: 'Mercury', tarot: 'The Lovers',
    energyDescription: 'Curiosity multiplies. Conversations spark ideas. The world offers itself in opposites and you hold both with ease. Follow the thread.',
  },
  {
    name: 'Cancer', symbol: '♋', startDay: 172, endDay: 203,
    element: 'water', planet: 'Moon', tarot: 'The Chariot',
    energyDescription: 'The heart leads the way. Home, memory, and tender care become sacred. Emotions are information. Protect what nourishes you.',
  },
  {
    name: 'Leo', symbol: '♌', startDay: 204, endDay: 234,
    element: 'fire', planet: 'Sun', tarot: 'Strength',
    energyDescription: 'Radiance at its peak. Creativity, courage, and generous warmth. The Sun knows its purpose — so do you. Shine without apology.',
  },
  {
    name: 'Virgo', symbol: '♍', startDay: 235, endDay: 265,
    element: 'earth', planet: 'Mercury', tarot: 'The Hermit',
    energyDescription: 'Refinement and discernment. The harvest asks for careful attention. Tend the details, craft your practice, serve with precision.',
  },
  {
    name: 'Libra', symbol: '♎', startDay: 266, endDay: 295,
    element: 'air', planet: 'Venus', tarot: 'Justice',
    energyDescription: 'The scales seek balance. Relationships become mirrors. Aesthetic intelligence deepens. Weigh with care; beauty and fairness align.',
  },
  {
    name: 'Scorpio', symbol: '♏', startDay: 296, endDay: 325,
    element: 'water', planet: 'Pluto', tarot: 'Death',
    energyDescription: 'Depth, transformation, and the sacred power of release. What no longer serves must fall away. Rebirth waits in the dark.',
  },
  {
    name: 'Sagittarius', symbol: '♐', startDay: 326, endDay: 355,
    element: 'fire', planet: 'Jupiter', tarot: 'Temperance',
    energyDescription: 'The archer aims at the horizon. Philosophy, adventure, and expansive truth. Question everything; wander with purpose.',
  },
  {
    name: 'Capricorn', symbol: '♑', startDay: 356, endDay: 365,
    element: 'earth', planet: 'Saturn', tarot: 'The Devil',
    energyDescription: 'Disciplined ambition meets quiet determination. A time for building structures that last — slow, intentional, and rooted. Saturn rewards patience.',
  },
];

export const FULL_MOONS: FullMoon[] = [
  { name: 'Wolf Moon',       date: '2025-01-13', description: 'Named for howling winter wolves. A time for inner clarity and solitude.' },
  { name: 'Snow Moon',       date: '2025-02-12', description: 'Heaviest snowfalls. Rest, conserve energy, and dream.' },
  { name: 'Worm Moon',       date: '2025-03-14', description: 'Earth softens, worms surface. Preparation for new growth.' },
  { name: 'Pink Moon',       date: '2025-04-13', description: 'Named for wild phlox blooms. Renewal and tender beginnings.' },
  { name: 'Flower Moon',     date: '2025-05-12', description: 'Abundance of spring flowers. Gratitude and flourishing.' },
  { name: 'Strawberry Moon', date: '2025-06-11', description: 'Strawberry harvest season. Sweetness, joy, and fruition.' },
  { name: 'Buck Moon',       date: '2025-07-10', description: 'Deer antlers in full growth. Strength and forward motion.' },
  { name: 'Sturgeon Moon',   date: '2025-08-09', description: 'Great fish were caught. Deep nourishment and abundance.' },
  { name: 'Harvest Moon',    date: '2025-09-07', description: 'Light for the harvest. Gratitude, completion, gathering.' },
  { name: "Hunter's Moon",   date: '2025-10-07', description: 'Hunting season begins. Focus, preparation, and awareness.' },
  { name: 'Beaver Moon',     date: '2025-11-05', description: 'Beavers build their lodges. Industriousness and shelter.' },
  { name: 'Cold Moon',       date: '2025-12-04', description: 'Long cold nights. Reflection, stillness, and inner fire.' },
  { name: 'Wolf Moon',       date: '2026-01-03', description: 'Named for howling winter wolves. A time for inner clarity and solitude.' },
  { name: 'Snow Moon',       date: '2026-02-01', description: 'Heaviest snowfalls. Rest, conserve energy, and dream.' },
  { name: 'Worm Moon',       date: '2026-03-03', description: 'Earth softens, worms surface. Preparation for new growth.' },
  { name: 'Pink Moon',       date: '2026-04-02', description: 'Named for wild phlox blooms. Renewal and tender beginnings.' },
  { name: 'Flower Moon',     date: '2026-05-01', description: 'Abundance of spring flowers. Gratitude and flourishing.' },
  { name: 'Strawberry Moon', date: '2026-05-31', description: 'Strawberry harvest season. Sweetness, joy, and fruition.' },
  { name: 'Buck Moon',       date: '2026-06-30', description: 'Deer antlers in full growth. Strength and forward motion.' },
  { name: 'Sturgeon Moon',   date: '2026-07-29', description: 'Great fish were caught. Deep nourishment and abundance.' },
  { name: 'Harvest Moon',    date: '2026-08-28', description: 'Light for the harvest. Gratitude, completion, gathering.' },
  { name: "Hunter's Moon",   date: '2026-09-26', description: 'Hunting season begins. Focus, preparation, and awareness.' },
  { name: 'Beaver Moon',     date: '2026-10-25', description: 'Beavers build their lodges. Industriousness and shelter.' },
  { name: 'Cold Moon',       date: '2026-11-24', description: 'Long cold nights. Reflection, stillness, and inner fire.' },
  { name: 'Wolf Moon',       date: '2026-12-23', description: 'Named for howling winter wolves. A time for inner clarity and solitude.' },
];

export const ELEMENT_COLORS: Record<Element, { bg: string; text: string; dot: string }> = {
  fire:  { bg: '#FAEEE6', text: '#A04020', dot: '#C8673A' },
  earth: { bg: '#EAF2E5', text: '#3A6A28', dot: '#6A9B52' },
  air:   { bg: '#E2F3F8', text: '#1A7A96', dot: '#4CA8C8' },
  water: { bg: '#EEE8F8', text: '#4A2A90', dot: '#6B50A8' },
};

export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

export function getZodiacForDay(dayOfYear: number): ZodiacSign {
  for (const sign of ZODIAC_SIGNS) {
    if (dayOfYear >= sign.startDay && dayOfYear <= sign.endDay) return sign;
  }
  return ZODIAC_SIGNS[0];
}

export function getNextFullMoon(fromDate: Date): FullMoon {
  const today = fromDate.getTime();
  const future = FULL_MOONS.filter((m) => new Date(m.date).getTime() >= today);
  return future[0] ?? FULL_MOONS[FULL_MOONS.length - 1];
}

export function getSeason(dayOfYear: number): string {
  if (dayOfYear < 79 || dayOfYear >= 355) return 'Winter';
  if (dayOfYear < 172) return 'Spring';
  if (dayOfYear < 265) return 'Summer';
  return 'Autumn';
}

export function getTodayInfo(date: Date): TodayInfo {
  const doy = getDayOfYear(date);
  return {
    zodiac:            getZodiacForDay(doy),
    element:           getZodiacForDay(doy).element,
    planet:            getZodiacForDay(doy).planet,
    tarot:             getZodiacForDay(doy).tarot,
    energyDescription: getZodiacForDay(doy).energyDescription,
    season:            getSeason(doy),
    nextFullMoon:      getNextFullMoon(date),
  };
}