import fs from 'fs';
import path from 'path';

interface RawCard {
  category: string;
  source: string;
  idol: string;
  grade: string;
  url?: string;
}

interface RawData {
  cards: RawCard[];
}

interface CleanCard {
  id: string;
  name: string;
  group: string;
  category: string;
  grade: string;
  image: string;
  era: string;
  year: number;
}

const RAW_FILE_PATH = path.join(process.cwd(), 'public/data/kpop_data_raw.json');
const OUTPUT_FILE_PATH = path.join(process.cwd(), 'public/data/kpop_data.json');

const EXCLUDED_KEYWORDS = [
  'lightstick', 'Lightstick',
  'Position', 'position',
  'Comeback', 'comeback',
  'Suggestion', 'suggestion',
  'Guide', 'guide',
  'List of', 'list of',
  'Kpop Girl Group', 'Kpop Boy Group'
];

function cleanIdolName(name: string): string {
  if (!name) return '';
  let cleaned = name;

  // Remove prefixes
  cleaned = cleaned.replace(/^Former Member:\s*/i, '');
  cleaned = cleaned.replace(/^Member Profile:\s*/i, '');
  cleaned = cleaned.replace(/^Members Profile:\s*/i, '');
  cleaned = cleaned.replace(/^Name:\s*/i, '');
  cleaned = cleaned.replace(/^Profile:\s*/i, '');

  // Remove (Rank N) suffix
  cleaned = cleaned.replace(/\s*\(Rank\s*\d+\)$/i, '');

  // Remove text in parentheses containing Korean or numbers
  // This is a broad regex to match parentheses with non-English characters or digits
  cleaned = cleaned.replace(/\s*\([^)]*[\u3131-\uD79D0-9][^)]*\)/g, '');

  // Remove null bytes
  cleaned = cleaned.replace(/\0/g, '');
  cleaned = cleaned.replace(/\u0000/g, '');

  // Standardize spacing
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

function cleanSource(source: string): string {
  if (!source) return '';
  let cleaned = source;

  cleaned = cleaned.replace(/\s*Profile$/i, '');
  cleaned = cleaned.replace(/\s*Facts$/i, '');
  cleaned = cleaned.replace(/^[#\(\s]+/, '');

  return cleaned.trim();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '_')
    .replace(/^-+|-+$/g, '');
}

function transform() {
  if (!fs.existsSync(RAW_FILE_PATH)) {
    console.error(`Error: ${RAW_FILE_PATH} not found.`);
    return;
  }

  const rawData: RawData = JSON.parse(fs.readFileSync(RAW_FILE_PATH, 'utf-8'));
  const transformedCards: CleanCard[] = [];
  const seenIds = new Set<string>();

  for (const raw of rawData.cards) {
    // a. REMOVE non-idol entries
    if (EXCLUDED_KEYWORDS.some(kw => raw.source.includes(kw))) continue;

    // b. CLEAN idol names
    const cleanedName = cleanIdolName(raw.idol);

    // c. CLEAN source names (group names)
    const cleanedGroup = cleanSource(raw.source);

    // d. SKIP cards where cleaned idol name is empty or less than 2 characters
    if (!cleanedName || cleanedName.length < 2) continue;

    // f. Generate proper IDs
    const idolSlug = slugify(cleanedName);
    const groupSlug = slugify(cleanedGroup);
    const cardId = `${groupSlug}_${idolSlug}`;

    // e. DEDUPLICATE
    if (seenIds.has(cardId)) continue;
    seenIds.add(cardId);

    transformedCards.push({
      id: cardId,
      name: cleanedName,
      group: cleanedGroup,
      category: raw.category,
      grade: raw.grade,
      image: `/api/get-image?group=${encodeURIComponent(cleanedGroup)}&idol=${encodeURIComponent(cleanedName)}`,
      era: "KPOP Collection",
      year: 2024
    });
  }

  const outputData = { cards: transformedCards };
  fs.writeFileSync(OUTPUT_FILE_PATH, JSON.stringify(outputData, null, 2));
  console.log(`Successfully transformed ${transformedCards.length} cards.`);
}

transform();
