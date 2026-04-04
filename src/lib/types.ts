export type Grade = 'R' | 'SR' | 'SSR' | 'UR';

export interface RawCard {
  name: string;
  group: string;
  gender: string;
  image: string;
  debut: number;
  album: string;
}

export interface Card extends RawCard {
  grade: Grade;
}

export interface UserCard extends Card {
  instanceId: string;
  obtainedAt: number;
}

export interface UserStats {
  credits: number;
  collection: UserCard[];
}

export const GRADE_WEIGHTS: Record<Grade, number> = {
  'R': 70,
  'SR': 20,
  'SSR': 8,
  'UR': 2,
};

export const GRADE_COLORS: Record<Grade, string> = {
  'R': 'text-slate-400',
  'SR': 'text-blue-400',
  'SSR': 'text-purple-400',
  'UR': 'text-yellow-400',
};
