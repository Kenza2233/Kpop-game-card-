export type Grade = 'UR' | 'SSR' | 'SR' | 'R';
export type Category = 'Girl Group' | 'Boy Group' | 'Female Solo' | 'Male Solo';
export type BannerType = 'standard' | 'featured' | 'limited' | 'newcomer';

export interface KpopCard {
  id: string;
  name: string;
  group: string;
  category: Category;
  image: string;
  era: string;
  year: number;
  grade?: Grade;
  isNew?: boolean;
}

export interface OwnedCard extends KpopCard {
  instanceId: string; // unique per pull instance
  acquiredAt: number; // timestamp
  pullCount: number; // which pull number
  fromBanner?: BannerType;
}

export interface Banner {
  id: string;
  name: string;
  type: BannerType;
  description: string;
  rateUpCards?: string[]; // card IDs with boosted rates
  startDate: string;
  endDate: string;
  image: string;
}

export interface GachaPullResult {
  card: OwnedCard;
  isRateUp: boolean;
  isNewCard: boolean;
  pityTriggered: boolean;
}

export interface PullHistoryEntry {
  pullNumber: number;
  card: OwnedCard;
  banner: BannerType;
  timestamp: number;
  currencySpent: number;
}

export interface CollectionState {
  ownedCards: OwnedCard[];
  totalPulls: number;
  currency: number;
  urPityCounter: number;
  ssrPityCounter: number;
  sparkPoints: number;
  lastFreePull: number | null;
  lastDailyBonus: number | null;
  currentBanner: string;
  pullHistory: PullHistoryEntry[];
  achievements: string[];
  dailyStreak: number;
  lastStreakDate: number | null;
}

export type SortOption = 'name-asc' | 'name-desc' | 'grade-desc' | 'grade-asc' | 'newest' | 'group';
export type GradeFilter = 'all' | Grade;
export type CategoryFilter = 'all' | Category;

// Configuration for Gacha Rates
export const GRADE_WEIGHTS: Record<Grade, number> = {
  'UR': 2,
  'SSR': 8,
  'SR': 20,
  'R': 70,
};

export const GRADE_COLORS: Record<Grade, string> = {
  'UR': 'text-yellow-400',
  'SSR': 'text-purple-400',
  'SR': 'text-blue-400',
  'R': 'text-slate-400',
};
