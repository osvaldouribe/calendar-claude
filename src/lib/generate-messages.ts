/**
 * Core generation logic shared between CLI and API.
 */
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';

const client = new Anthropic();

export const SIGNS = [
  { name: 'Capricorn',   element: 'earth' },
  { name: 'Aquarius',    element: 'air'   },
  { name: 'Pisces',      element: 'water' },
  { name: 'Aries',       element: 'fire'  },
  { name: 'Taurus',      element: 'earth' },
  { name: 'Gemini',      element: 'air'   },
  { name: 'Cancer',      element: 'water' },
  { name: 'Leo',         element: 'fire'  },
  { name: 'Virgo',       element: 'earth' },
  { name: 'Libra',       element: 'air'   },
  { name: 'Scorpio',     element: 'water' },
  { name: 'Sagittarius', element: 'fire'  },
] as const;

export const QUARTER_RANGES: Record<number, [number, number]> = {
  1: [1,  13],
  2: [14, 26],
  3: [27, 39],
  4: [40, 52],
};

function weekToApproxDate(week: number): string {
  const date = new Date(new Date().getFullYear(), 0, 1 + (week - 1) * 7);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

function weekToSeason(week: number): string {
  if (week <= 11) return 'winter';
  if (week <= 24) return 'spring';
  if (week <= 37) return 'summer';
  if (week <= 50) return 'autumn';
  return 'winter';
}

async function generateMessage(signName: string, element: string, week: number): Promise<string> {
  const season     = weekToSeason(week);
  const approxDate = weekToApproxDate(week);

  const response = await client.messages.create({
    model:      'claude-sonnet-4-6',
    max_tokens: 150,
    messages: [{
      role:    'user',
      content: `Write a short cosmic message for a ${signName} (birth element: ${element}) for week ${week} of the year, around ${approxDate}, during ${season}.

The message should:
- Be 2–3 sentences, 40–60 words
- Speak directly to the reader ("you", "your")
- Weave the ${element} birth energy with the ${season} season's quality in a specific, grounded way
- Be poetic but not vague — name actual qualities, tensions, or opportunities
- Match this tone and style exactly: "Your fire meets grounding earth. The urge to act slows into something more deliberate. Let this season temper your spark into lasting work."

Write only the message. No quotes, no preamble, no sign-off.`,
    }],
  });

  return (response.content[0] as { type: 'text'; text: string }).text.trim();
}

async function runBatched<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number,
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    const slice = tasks.slice(i, i + concurrency);
    results.push(...await Promise.all(slice.map(fn => fn())));
  }
  return results;
}

export async function generateQuarterMessages(
  quarter: number,
  dataPath: string,
  onProgress?: (message: string) => void,
): Promise<{ success: boolean; message: string; messagesGenerated: number }> {
  if (!QUARTER_RANGES[quarter]) {
    return { success: false, message: 'Invalid quarter (1–4)', messagesGenerated: 0 };
  }

  const [startWeek, endWeek] = QUARTER_RANGES[quarter];
  let data: Record<string, Record<string, string>> = {};

  try {
    if (fs.existsSync(dataPath)) {
      data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }
  } catch (err) {
    return { success: false, message: `Failed to read data file: ${err}`, messagesGenerated: 0 };
  }

  const totalMessages = (endWeek - startWeek + 1) * SIGNS.length;
  let messagesGenerated = 0;

  try {
    onProgress?.(
      `Generating Q${quarter} (weeks ${startWeek}–${endWeek}) × ${SIGNS.length} signs = ${totalMessages} messages\n`,
    );

    for (const sign of SIGNS) {
      if (!data[sign.name]) data[sign.name] = {};

      const weeks = Array.from(
        { length: endWeek - startWeek + 1 },
        (_, i) => startWeek + i,
      );

      const tasks = weeks.map(week => async () => {
        const msg = await generateMessage(sign.name, sign.element, week);
        data[sign.name][String(week)] = msg;
        messagesGenerated++;
        onProgress?.('.');
      });

      await runBatched(tasks, 8);
      onProgress?.(`  ✓ ${sign.name}\n`);

      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    }

    return {
      success: true,
      message: `Done! Generated ${messagesGenerated}/${totalMessages} messages for Q${quarter}`,
      messagesGenerated,
    };
  } catch (err) {
    return {
      success: false,
      message: `Generation failed: ${err}`,
      messagesGenerated,
    };
  }
}
