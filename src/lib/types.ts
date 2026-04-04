export type Rarity = 'Common' | 'Rare' | 'Super Rare' | 'Ultra Rare';

export interface Card {
  id: string;
  name: string;
  group: string;
  rarity: Rarity;
  imageUrl: string;
  description?: string;
}

export interface UserCard extends Card {
  instanceId: string;
  obtainedAt: number;
}

export interface UserStats {
  credits: number;
  collection: UserCard[];
  lastDailyCollection?: number;
}

export const RARITY_WEIGHTS: Record<Rarity, number> = {
  'Common': 70,
  'Rare': 20,
  'Super Rare': 8,
  'Ultra Rare': 2,
};

export const RARITY_COLORS: Record<Rarity, string> = {
  'Common': 'text-gray-400',
  'Rare': 'text-blue-400',
  'Super Rare': 'text-purple-400',
  'Ultra Rare': 'text-yellow-400',
};
