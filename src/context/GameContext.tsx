'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { KpopCard, CollectionState, OwnedCard, PullHistoryEntry, BannerType } from '../lib/types';
import { processCards, deduplicateCards } from '../lib/cardUtils';
import { fetchCardData } from '../lib/dataFetcher';

interface GameContextType {
  allCards: KpopCard[];
  state: CollectionState;
  loading: boolean;
  addOwnedCard: (card: KpopCard, fromBanner: string, currencySpent: number) => void;
  updateCurrency: (amount: number) => void;
  incrementPity: (grade: 'UR' | 'SSR') => void;
  resetPity: (grade: 'UR' | 'SSR') => void;
  refreshData: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const INITIAL_STATE: CollectionState = {
  ownedCards: [],
  totalPulls: 0,
  currency: 1000,
  urPityCounter: 0,
  ssrPityCounter: 0,
  sparkPoints: 0,
  lastFreePull: null,
  lastDailyBonus: null,
  currentBanner: 'standard',
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
      // The data might be an object with a cards property or a direct array
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
    // Load from localStorage
    const savedState = localStorage.getItem('kpop_gacha_v2_state');
    if (savedState) {
      try {
        setState(JSON.parse(savedState));
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

  const addOwnedCard = (card: KpopCard, fromBanner: string, currencySpent: number) => {
    const banner = fromBanner as BannerType;
    const newOwnedCard: OwnedCard = {
      ...card,
      instanceId: Math.random().toString(36).substr(2, 9),
      acquiredAt: Date.now(),
      pullCount: state.totalPulls + 1,
      fromBanner: banner,
    };

    const newHistoryEntry: PullHistoryEntry = {
      pullNumber: state.totalPulls + 1,
      card: newOwnedCard,
      banner: banner,
      timestamp: Date.now(),
      currencySpent,
    };

    setState(prev => ({
      ...prev,
      ownedCards: [...prev.ownedCards, newOwnedCard],
      totalPulls: prev.totalPulls + 1,
      pullHistory: [newHistoryEntry, ...prev.pullHistory].slice(0, 100), // Keep last 100
      sparkPoints: prev.sparkPoints + 1,
    }));
  };

  const updateCurrency = (amount: number) => {
    setState(prev => ({
      ...prev,
      currency: prev.currency + amount,
    }));
  };

  const incrementPity = (grade: 'UR' | 'SSR') => {
    setState(prev => ({
      ...prev,
      urPityCounter: grade === 'UR' ? prev.urPityCounter + 1 : prev.urPityCounter,
      ssrPityCounter: grade === 'SSR' ? prev.ssrPityCounter + 1 : prev.ssrPityCounter,
    }));
  };

  const resetPity = (grade: 'UR' | 'SSR') => {
    setState(prev => ({
      ...prev,
      urPityCounter: grade === 'UR' ? 0 : prev.urPityCounter,
      ssrPityCounter: grade === 'SSR' ? 0 : prev.ssrPityCounter,
    }));
  };

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
        refreshData: loadData,
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
