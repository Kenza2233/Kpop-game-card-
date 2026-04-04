import { KpopCard, Grade, GRADE_WEIGHTS } from './types';

/**
 * Cleans idol name by removing common emojis and trimming whitespace.
 * Keeps international characters like Korean Hangul.
 */
export function cleanIdolName(name: string): string {
  if (!name) return 'Unknown Idol';

  return name
    .replace(/[\u1F600-\u1F64F\u1F300-\u1F5FF\u1F680-\u1F6FF\u1F1E0-\u1F1FF\u2600-\u26FF\u2700-\u27BF]/g, '')
    .replace(/[✨⭐🌟💫💖🔥💎]/g, '')
    .trim();
}

/**
 * Randomly assigns UR, SSR, SR, or R grades to cards based on defined weights if they don't have one.
 */
export function processCards(cards: KpopCard[]): KpopCard[] {
  return cards.map(card => {
    const grade = card.grade || getRandomGrade();
    return {
      ...card,
      grade,
      name: cleanIdolName(card.name),
    };
  });
}

export function getRandomGrade(): Grade {
  const totalWeight = Object.values(GRADE_WEIGHTS).reduce((acc, weight) => acc + weight, 0);
  let random = Math.random() * totalWeight;

  for (const [grade, weight] of Object.entries(GRADE_WEIGHTS)) {
    if (random < weight) {
      return grade as Grade;
    }
    random -= weight;
  }

  return 'R'; // Fallback
}

/**
 * Removes duplicate cards from an array based on their ID.
 */
export function deduplicateCards(cards: KpopCard[]): KpopCard[] {
  const seenIds = new Set<string>();
  return cards.filter((card) => {
    if (!card.id) return true; // Keep cards without IDs
    if (seenIds.has(card.id)) {
      return false;
    }
    seenIds.add(card.id);
    return true;
  });
}
