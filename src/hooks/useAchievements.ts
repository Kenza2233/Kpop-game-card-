'use client';

import { useState, useCallback, useMemo } from 'react';
import { CollectionState, Grade, KpopCard } from '../lib/types';

interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: (state: CollectionState, allCards: KpopCard[]) => boolean;
  progress: (state: CollectionState, allCards: KpopCard[]) => number;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_pull',
    name: 'First Pull',
    description: 'Complete your first pull',
    condition: (state) => state.totalPulls > 0,
    progress: (state) => Math.min(state.totalPulls, 1),
  },
  {
    id: 'collector',
    name: 'Collector',
    description: 'Own 50 unique cards',
    condition: (state) => new Set(state.ownedCards.map(c => c.id)).size >= 50,
    progress: (state) => Math.min(new Set(state.ownedCards.map(c => c.id)).size / 50, 1),
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Own 200 unique cards',
    condition: (state) => new Set(state.ownedCards.map(c => c.id)).size >= 200,
    progress: (state) => Math.min(new Set(state.ownedCards.map(c => c.id)).size / 200, 1),
  },
  {
    id: 'whale',
    name: 'Whale',
    description: 'Spend 10,000 total coins',
    condition: (state) => state.pullHistory.reduce((acc, p) => acc + p.currencySpent, 0) >= 10000,
    progress: (state) => Math.min(state.pullHistory.reduce((acc, p) => acc + p.currencySpent, 0) / 10000, 1),
  },
  {
    id: 'lucky',
    name: 'Lucky',
    description: 'Pull a UR within first 10 pulls',
    condition: (state) => state.ownedCards.some(c => c.grade === 'UR' && c.pullCount <= 10),
    progress: (state) => state.ownedCards.some(c => c.grade === 'UR' && c.pullCount <= 10) ? 1 : 0,
  },
  {
    id: 'unlucky',
    name: 'Unlucky',
    description: 'Reach 90+ pity without UR',
    condition: (state) => state.urPityCounter >= 90,
    progress: (state) => Math.min(state.urPityCounter / 90, 1),
  },
  {
    id: 'completionist',
    name: 'Completionist',
    description: 'Own all cards from one group',
    condition: (state, allCards) => {
      const ownedIds = new Set(state.ownedCards.map(c => c.id));
      const groups = Array.from(new Set(allCards.map(c => c.group)));

      return groups.some(group => {
        const groupCards = allCards.filter(c => c.group === group);
        if (groupCards.length === 0) return false;
        return groupCards.every(c => ownedIds.has(c.id));
      });
    },
    progress: (state, allCards) => {
      const ownedIds = new Set(state.ownedCards.map(c => c.id));
      const groups = Array.from(new Set(allCards.map(c => c.group)));

      let maxProgress = 0;
      groups.forEach(group => {
        const groupCards = allCards.filter(c => c.group === group);
        if (groupCards.length === 0) return;
        const ownedInGroup = groupCards.filter(c => ownedIds.has(c.id)).length;
        maxProgress = Math.max(maxProgress, ownedInGroup / groupCards.length);
      });
      return maxProgress;
    },
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: '7-day login streak',
    condition: (state) => state.dailyStreak >= 7,
    progress: (state) => Math.min(state.dailyStreak / 7, 1),
  },
  {
    id: 'spark_user',
    name: 'Spark User',
    description: 'Use spark system',
    condition: (state) => state.ownedCards.some(c => c.fromBanner === 'limited'), // Simplified check
    progress: (state) => 0,
  },
  {
    id: 'duplicate_king',
    name: 'Duplicate King',
    description: 'Convert 50 duplicates',
    condition: (state) => (state.totalPulls - new Set(state.ownedCards.map(c => c.id)).size) >= 50,
    progress: (state) => Math.min((state.totalPulls - new Set(state.ownedCards.map(c => c.id)).size) / 50, 1),
  }
];

export function useAchievements(state: CollectionState) {
  const unlockedIds = useMemo(() => state.achievements || [], [state.achievements]);

  const checkAchievements = useCallback((currentState: CollectionState, allCards: KpopCard[]) => {
    const newlyUnlocked: Achievement[] = [];

    ACHIEVEMENTS.forEach((achievement) => {
      if (!unlockedIds.includes(achievement.id) && achievement.condition(currentState, allCards)) {
        newlyUnlocked.push(achievement);
      }
    });

    return newlyUnlocked;
  }, [unlockedIds]);

  const getProgress = (id: string, allCards: KpopCard[]) => {
    const achievement = ACHIEVEMENTS.find(a => a.id === id);
    if (!achievement) return 0;
    return achievement.progress(state, allCards);
  };

  return {
    achievements: ACHIEVEMENTS,
    unlockedIds,
    checkAchievements,
    getProgress
  };
}
