'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  KpopCard,
  CollectionState,
  OwnedCard,
  PullHistoryEntry,
  BannerType,
  DUPLICATE_REWARDS,
  DAILY_BONUS,
  Grade,
  SPARK_POINTS_PER_PULL,
  SPARK_COST
} from '../lib/types';
import { processCards, deduplicateCards } from '../lib/cardUtils';
import { fetchCardData } from '../lib/dataFetcher';

interface GameContextType {
  allCards: KpopCard[];
  state: CollectionState;
  loading: boolean;
  addOwnedCard: (card: KpopCard, fromBannerId: string, currencySpent: number) => { isDuplicate: boolean; coinReward: number };
  updateCurrency: (amount: number) => void;
  incrementPity: (grade: 'UR' | 'SSR') => void;
  resetPity: (grade: 'UR' | 'SSR') => void;
  claimDailyBonus: () => { success: boolean; amount: number; message: string };
  claimFreePull: () => boolean;
  refreshData: () => Promise<void>;
  updateSparkPoints: (bannerId: string, points: number) => void;
  sparkCard: (bannerId: string, card: KpopCard) => OwnedCard | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const INITIAL_STATE: CollectionState = {
  ownedCards: [],
  totalPulls: 0,
  currency: 500, // Reduced as per requirement
  urPityCounter: 0,
  ssrPityCounter: 0,
  sparkPoints: {},
  lastFreePull: null,
  lastDailyBonus: null,
  currentBannerId: 'standard',
  pullHistory: [],
  achievements: [],
  dailyStreak: 0,
  lastStreakDate: null,
};

export function GameProvider({ children }: { children: ReactNode }) {
  const [allCards, setAllCards] = useState<KpopCard[]>([]);
  const [state, setState] = useState<CollectionState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchCardData('/data/kpop_data.json');
      const rawCards: KpopCard[] = Array.isArray(data) ? data : (data as any).cards || [];
      const deduplicated = deduplicateCards(rawCards);
      const processedCards = processCards(deduplicated);
      setAllCards(processedCards);
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedState = localStorage.getItem('kpop_gacha_v2_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Basic migration if needed
        if (typeof parsed.sparkPoints === 'number') {
          parsed.sparkPoints = { standard: parsed.sparkPoints };
        }
        setState(parsed);
      } catch {
        console.error('Corrupted state in localStorage');
        setState(INITIAL_STATE);
      }
    }

    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('kpop_gacha_v2_state', JSON.stringify(state));
    }
  }, [state, loading]);

  const addOwnedCard = useCallback((card: KpopCard, fromBannerId: string, currencySpent: number) => {
    const isDuplicate = state.ownedCards.some(oc => oc.id === card.id);
    const coinReward = isDuplicate ? DUPLICATE_REWARDS[card.grade as Grade || 'R'] : 0;

    const newOwnedCard: OwnedCard = {
      ...card,
      instanceId: Math.random().toString(36).substring(2, 11),
      acquiredAt: Date.now(),
      pullCount: state.totalPulls + 1,
      fromBanner: 'standard' as BannerType, // Simplified for history
    };

    const newHistoryEntry: PullHistoryEntry = {
      pullNumber: state.totalPulls + 1,
      card: newOwnedCard,
      banner: 'standard', // Simplified
      timestamp: Date.now(),
      currencySpent,
    };

    const pointsEarned = SPARK_POINTS_PER_PULL[card.grade as Grade || 'R'];

    setState(prev => ({
      ...prev,
      ownedCards: [...prev.ownedCards, newOwnedCard],
      totalPulls: prev.totalPulls + 1,
      currency: prev.currency + coinReward,
      pullHistory: [newHistoryEntry, ...prev.pullHistory].slice(0, 100),
      sparkPoints: {
        ...prev.sparkPoints,
        [fromBannerId]: (prev.sparkPoints[fromBannerId] || 0) + pointsEarned
      }
    }));

    return { isDuplicate, coinReward };
  }, [state.ownedCards, state.totalPulls]);

  const updateCurrency = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      currency: prev.currency + amount,
    }));
  }, []);

  const incrementPity = useCallback((grade: 'UR' | 'SSR') => {
    setState(prev => ({
      ...prev,
      urPityCounter: grade === 'UR' ? prev.urPityCounter + 1 : prev.urPityCounter,
      ssrPityCounter: grade === 'SSR' ? prev.ssrPityCounter + 1 : prev.ssrPityCounter,
    }));
  }, []);

  const resetPity = useCallback((grade: 'UR' | 'SSR') => {
    setState(prev => ({
      ...prev,
      urPityCounter: grade === 'UR' ? 0 : prev.urPityCounter,
      ssrPityCounter: grade === 'SSR' ? 0 : prev.ssrPityCounter,
    }));
  }, []);

  const updateSparkPoints = useCallback((bannerId: string, points: number) => {
    setState(prev => ({
      ...prev,
      sparkPoints: {
        ...prev.sparkPoints,
        [bannerId]: (prev.sparkPoints[bannerId] || 0) + points
      }
    }));
  }, []);

  const sparkCard = useCallback((bannerId: string, card: KpopCard) => {
    const currentPoints = state.sparkPoints[bannerId] || 0;
    if (currentPoints < SPARK_COST) return null;

    const isDuplicate = state.ownedCards.some(oc => oc.id === card.id);
    const coinReward = isDuplicate ? DUPLICATE_REWARDS[card.grade as Grade || 'R'] : 0;

    const newOwnedCard: OwnedCard = {
      ...card,
      instanceId: Math.random().toString(36).substring(2, 11),
      acquiredAt: Date.now(),
      pullCount: state.totalPulls, // Not a pull, but part of collection
      fromBanner: 'standard' as BannerType,
    };

    setState(prev => ({
      ...prev,
      ownedCards: [...prev.ownedCards, newOwnedCard],
      currency: prev.currency + coinReward,
      sparkPoints: {
        ...prev.sparkPoints,
        [bannerId]: (prev.sparkPoints[bannerId] || 0) - SPARK_COST
      }
    }));

    return newOwnedCard;
  }, [state.sparkPoints, state.ownedCards, state.totalPulls]);

  const claimDailyBonus = useCallback(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (state.lastDailyBonus && state.lastDailyBonus >= today) {
      return { success: false, amount: 0, message: "Already claimed today!" };
    }

    let newStreak = 1;
    const yesterday = today - 86400000;

    if (state.lastDailyBonus && state.lastDailyBonus >= yesterday) {
      newStreak = (state.dailyStreak % 7) + 1;
    }

    const amount = newStreak === 7 ? DAILY_BONUS.DAY_7 : DAILY_BONUS.BASE;

    setState(prev => ({
      ...prev,
      currency: prev.currency + amount,
      dailyStreak: newStreak,
      lastDailyBonus: Date.now(),
      lastStreakDate: Date.now()
    }));

    return {
      success: true,
      amount,
      message: `Claimed ${amount} coins! ${newStreak === 7 ? '7-day streak bonus!' : `Streak: ${newStreak} days`}`
    };
  }, [state.lastDailyBonus, state.dailyStreak]);

  const claimFreePull = useCallback(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (state.lastFreePull && state.lastFreePull >= today) {
      return false;
    }

    setState(prev => ({
      ...prev,
      lastFreePull: Date.now()
    }));
    return true;
  }, [state.lastFreePull]);

  return (
    <GameContext.Provider
      value={{
        allCards,
        state,
        loading,
        addOwnedCard,
        updateCurrency,
        incrementPity,
        resetPity,
        claimDailyBonus,
        claimFreePull,
        refreshData: loadData,
        updateSparkPoints,
        sparkCard
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
