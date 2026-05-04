/**
 * Generates weekly cosmic messages for each zodiac sign using the Claude API.
 * Run per quarter: npm run generate:messages [1|2|3|4]
 * Omit the quarter arg to generate the current quarter.
 */
import * as path from 'path';
import { generateQuarterMessages, QUARTER_RANGES } from '../src/lib/generate-messages';

function getCurrentQuarter(): number {
  return Math.floor(new Date().getMonth() / 3) + 1;
}

async function main() {
  const quarterArg = process.argv[2];
  const quarter    = quarterArg ? parseInt(quarterArg, 10) : getCurrentQuarter();

  if (!QUARTER_RANGES[quarter]) {
    console.error('Usage: generate-weekly-messages [1|2|3|4]');
    process.exit(1);
  }

  const dataPath = path.join(__dirname, '..', 'src', 'data', 'weekly-messages.json');

  console.log('');
  const result = await generateQuarterMessages(quarter, dataPath, msg => {
    process.stdout.write(msg);
  });

  if (result.success) {
    console.log(`\n${result.message}\n`);
  } else {
    console.error(`\n${result.message}\n`);
    process.exit(1);
  }
}

main().catch(err => { console.error(err); process.exit(1); });

