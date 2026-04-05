import fs from 'fs';
import path from 'path';

const NON_IDOL_KEYWORDS = [
  'lightstick', 'Lightstick', 'position', 'Position',
  'comeback', 'Comeback', 'suggestion', 'Suggestion',
  'guide', 'Guide', 'list of', 'List of',
  'Kpop Girl Group', 'Kpop Boy Group', 'Kpop Positions',
  'Ultimate J-Pop Vocab', 'Suggestions', 'April Kpop Comebacks'
];

function cleanName(name) {
  return name
    .replace(/^Former Member:\s*/i, '')
    .replace(/^(?:\w+\s+\w+\s+)?Member Profile:\s*/i, '')
    .replace(/Members Profile:\s*/i, '')
    .replace(/Name:\s*/i, '')
    .replace(/Profile(?:\s+Facts)?:\s*/i, '')
    .replace(/\s*\(Rank\s+\d+\)/, '')
    .replace(/\s*\([^)]*[\u3131-\u318E\uAC00-\uD7AF]+\)/g, '')
    .replace(/\s*\(\s*\)/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanGroup(source) {
  return source
    .replace(/\s+Member(?:s)?\s+Profile.*$/i, '')
    .replace(/\s+Profile.*$/i, '')
    .replace(/\s+Facts.*$/i, '')
    .replace(/^\s*[\(#]+/, '')
    .replace(/^\s*#/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isNonIdol(source) {
  const lower = source.toLowerCase();
  return NON_IDOL_KEYWORDS.some(kw => lower.includes(kw.toLowerCase()));
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'unknown';
}

const rawPath = path.join(process.cwd(), 'public', 'data', 'kpop_data_raw.json');
const outputPath = path.join(process.cwd(), 'public', 'data', 'kpop_data.json');

if (!fs.existsSync(rawPath)) {
  console.log('No kpop_data_raw.json found, using empty placeholder');
  fs.writeFileSync(outputPath, JSON.stringify({ cards: [] }, null, 2));
  process.exit(0);
}

const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf-8'));
const rawCards = Array.isArray(rawData) ? rawData : (rawData.cards || []);

console.log('Processing', rawCards.length, 'raw cards...');

const seen = new Set();
const cleanCards = [];
let skipped = 0, duplicates = 0;

for (const card of rawCards) {
  if (isNonIdol(card.source)) { skipped++; continue; }
  const name = cleanName(card.idol);
  const group = cleanGroup(card.source);
  if (name.length < 2) { skipped++; continue; }
  const id = slugify(group) + '_' + slugify(name);
  if (seen.has(id)) { duplicates++; continue; }
  seen.add(id);
  cleanCards.push({
    id, name, group,
    category: card.category || 'Girl Group',
    grade: card.grade || 'R',
    image: '/api/get-image?group=' + encodeURIComponent(group) + '&idol=' + encodeURIComponent(name),
    era: 'KPOP Collection',
    year: 2024
  });
}

fs.writeFileSync(outputPath, JSON.stringify({ cards: cleanCards }, null, 2));
console.log('Done:', cleanCards.length, 'cards (skipped:', skipped, 'duplicates:', duplicates, ')');
