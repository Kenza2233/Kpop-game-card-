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
  isDuplicate: boolean;
  coinReward?: number;
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
  sparkPoints: Record<string, number>; // bannerId -> points
  lastFreePull: number | null; // timestamp
  lastDailyBonus: number | null; // timestamp
  currentBannerId: string;
  pullHistory: PullHistoryEntry[];
  achievements: string[];
  dailyStreak: number;
  lastStreakDate: number | null;
  unlimitedMode: boolean;
}

export type SortOption = 'name-asc' | 'name-desc' | 'grade-desc' | 'grade-asc' | 'newest' | 'group';
export type GradeFilter = 'all' | Grade;
export type CategoryFilter = 'all' | Category;

// BASE GACHA RATES (Standard Banner)
export const BASE_RATES: Record<Grade, number> = {
  'UR': 0.5,
  'SSR': 4.5,
  'SR': 30.0,
  'R': 65.0,
};

// Required for compatibility with utilities
export const GRADE_WEIGHTS: Record<Grade, number> = {
  'UR': 0.5,
  'SSR': 4.5,
  'SR': 30.0,
  'R': 65.0,
};

// SOFT PITY CONFIG
export const SOFT_PITY = {
  UR: {
    start: 75,
    increase: 0.5,
  },
  SSR: {
    start: 30,
    increase: 1.0,
  },
};

// HARD PITY CONFIG
export const HARD_PITY = {
  UR: 100,
  SSR: 60,
};

// COSTS
export const PULL_COSTS = {
  SINGLE: 150,
  TEN: 1350,
};

// DUPLICATE REWARDS
export const DUPLICATE_REWARDS: Record<Grade, number> = {
  'UR': 250,
  'SSR': 100,
  'SR': 25,
  'R': 5,
};

// SPARK CONFIG
export const SPARK_COST = 200;
export const SPARK_POINTS_PER_PULL: Record<Grade, number> = {
  'UR': 5,
  'SSR': 2,
  'SR': 1,
  'R': 1,
};

// DAILY BONUSES
export const DAILY_BONUS = {
  BASE: 300,
  DAY_7: 1000,
};

export const GRADE_COLORS: Record<Grade, string> = {
  'UR': 'text-yellow-400',
  'SSR': 'text-purple-400',
  'SR': 'text-blue-400',
  'R': 'text-slate-400',
};
