import { KpopCard, Grade } from './types';

/**
 * Aggressively cleans idol name by removing emojis, special unicode characters, numbers,
 * and normalizing whitespace. Keeps standard Latin and Hangul characters.
 */
export function cleanIdolName(name: string): string {
  if (!name) return 'Unknown Idol';

  return name
    .replace(/[\u1F600-\u1F64F\u1F300-\u1F5FF\u1F680-\u1F6FF\u1F1E0-\u1F1FF\u2600-\u26FF\u2700-\u27BF]/g, '')
    .replace(/[✨⭐🌟💫💖🔥💎]|[\d]|[\(\)]/g, '') // Remove emojis, numbers, parentheses
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

/**
 * Creates a deterministic ID from name + group + era.
 */
export function generateCardId(card: Partial<KpopCard>): string {
  const slugify = (text: string) =>
    (text || 'unknown').toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');

  return `${slugify(card.group || '')}_${slugify(card.name || '')}_${slugify(card.era || '')}`;
}

/**
 * Creates a UUID-like unique ID for each pull instance.
 */
export function generateInstanceId(): string {
  const timestamp = Date.now();
  const random6 = Math.random().toString(36).substring(2, 8);
  return `pull_${timestamp}_${random6}`;
}

/**
 * Returns visual configuration per grade.
 */
export function getGradeConfig(grade: Grade) {
  switch (grade) {
    case 'UR':
      return {
        label: 'Ultra Rare',
        borderColor: '#FFD700',
        gradient: 'radial-gradient(circle at center, #FFD700, #FFA500, #FF6347)',
        glowColor: 'rgba(255, 215, 0, 0.6)',
        shimmer: true,
        sparkleParticles: 12,
        animationDuration: '3s',
        textColor: '#FFD700',
        pattern: 'repeating-conic-gradient(#FFD700 0% 25%, transparent 0% 50%) 50% / 20px 20px'
      };
    case 'SSR':
      return {
        label: 'Super Super Rare',
        borderColor: '#C084FC',
        gradient: 'linear-gradient(var(--holo-angle, 135deg), #C084FC, #818CF8, #6366F1, #C084FC)',
        glowColor: 'rgba(192, 132, 252, 0.5)',
        shimmer: true,
        holographic: true,
        animationDuration: '4s',
        textColor: '#C084FC'
      };
    case 'SR':
      return {
        label: 'Super Rare',
        borderColor: '#60A5FA',
        gradient: 'linear-gradient(135deg, #60A5FA, #3B82F6, #2563EB)',
        glowColor: 'rgba(96, 165, 250, 0.4)',
        shimmer: true,
        animationDuration: '2.5s',
        textColor: '#60A5FA'
      };
    case 'R':
    default:
      return {
        label: 'Rare',
        borderColor: '#34D399',
        gradient: 'linear-gradient(135deg, #34D399, #10B981)',
        glowColor: 'rgba(52, 211, 153, 0.3)',
        shimmer: false,
        animationDuration: '0s',
        textColor: '#34D399'
      };
  }
}

/**
 * Fisher-Yates shuffle algorithm.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Assigns fixed grade percentages to an array of cards after shuffling.
 */
export function assignRandomGrades(cards: KpopCard[]): KpopCard[] {
  const shuffled = shuffleArray(cards);
  const total = shuffled.length;

  const urCount = Math.ceil(total * 0.02);
  const ssrCount = Math.ceil(total * 0.08);
  const srCount = Math.ceil(total * 0.30);

  return shuffled.map((card, index) => {
    let grade: Grade = 'R';
    if (index < urCount) grade = 'UR';
    else if (index < urCount + ssrCount) grade = 'SSR';
    else if (index < urCount + ssrCount + srCount) grade = 'SR';

    return { ...card, grade };
  });
}

/**
 * Utility for number formatting (e.g. 1000 -> 1,000).
 */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat().format(n);
}

/**
 * Calculates time remaining until the next free pull (24h cooldown).
 */
export function getTimeUntilReset(lastPull: number | null): string {
  if (!lastPull) return "Ready to pull!";

  const COOL_DOWN = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const diff = (lastPull + COOL_DOWN) - now;

  if (diff <= 0) return "Ready to pull!";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m remaining`;
}

/**
 * Required legacy support or batch processing.
 */
export function processCards(cards: KpopCard[]): KpopCard[] {
    return cards.map(card => ({
        ...card,
        name: cleanIdolName(card.name),
        id: card.id || generateCardId(card)
    }));
}

export function deduplicateCards(cards: KpopCard[]): KpopCard[] {
  const seenIds = new Set<string>();
  return cards.filter((card) => {
    if (!card.id) return true;
    if (seenIds.has(card.id)) return false;
    seenIds.add(card.id);
    return true;
  });
}
