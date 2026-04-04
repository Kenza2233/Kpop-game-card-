import { RawCard, Card, Grade, GRADE_WEIGHTS } from './types';

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
 * Removes duplicate entries based on name + group.
 */
export function deduplicateCards(cards: RawCard[]): RawCard[] {
  const seen = new Set<string>();
  return cards.filter(card => {
    const key = `${card.name.toLowerCase()}-${card.group.toLowerCase()}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Randomly assigns UR, SSR, SR, or R grades to cards based on defined weights.
 */
export function assignGrades(cards: RawCard[]): Card[] {
  return cards.map(card => {
    const grade = getRandomGrade();
    return {
      ...card,
      grade,
      name: cleanIdolName(card.name),
    };
  });
}

function getRandomGrade(): Grade {
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
