'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import {
  KpopCard,
  OwnedCard,
  PullHistoryEntry,
  BannerType,
  Grade,
  BASE_RATES,
  SOFT_PITY,
  HARD_PITY,
  PULL_COSTS,
  SPARK_COST,
  SPARK_POINTS_PER_PULL,
  DAILY_BONUS,
  DUPLICATE_REWARDS,
  GachaPullResult
} from '../lib/types';
import { processCards, deduplicateCards } from '../lib/cardUtils';
import { fetchCardData } from '../lib/dataFetcher';

interface CollectionState {
  version: number;
  ownedCards: OwnedCard[];
  totalPulls: number;
  currency: number;
  urPityCounter: number;
  ssrPityCounter: number;
  sparkPoints: Record<string, number>;
  lastFreePull: number | null;
  lastDailyBonus: number | null;
  currentBannerId: string;
  pullHistory: PullHistoryEntry[];
  achievements: string[];
  dailyStreak: number;
  lastStreakDate: number | null;
}

interface CollectionContextType {
  allCards: KpopCard[];
  state: CollectionState;
  loading: boolean;
  isSaving: boolean;
  pullCard: (bannerType: BannerType, count: number) => GachaPullResult[];
  claimFreePull: () => GachaPullResult | null;
  claimDailyBonus: () => { coins: number; streakDay: number; message: string };
  convertDuplicates: () => { cardsRemoved: number; coinsGained: number };
  sparkCard: (bannerId: string, cardId: string) => OwnedCard | null;
  setActiveBanner: (bannerId: string) => void;
  exportCollection: () => string;
  importCollection: (data: string) => boolean;
  refreshData: () => Promise<void>;
}

const CURRENT_VERSION = 1;
const STORAGE_KEY = 'kpop_gacha_v3_state';

const INITIAL_STATE: CollectionState = {
  version: CURRENT_VERSION,
  ownedCards: [],
  totalPulls: 0,
  currency: 500,
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

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

export function CollectionProvider({ children }: { children: ReactNode }) {
  const [allCards, setAllCards] = useState<KpopCard[]>([]);
  const [state, setState] = useState<CollectionState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration logic could go here
        setState(parsed);
      } catch (e) {
        console.error('Corrupted state in localStorage, resetting to defaults');
        setState(INITIAL_STATE);
      }
    }
    loadData();
  }, [loadData]);

  // Debounced Save
  useEffect(() => {
    if (loading) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    setIsSaving(true);
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        setIsSaving(false);
      } catch (e) {
        console.error('Storage full or error saving state:', e);
        alert('Could not save progress. Storage may be full!');
        setIsSaving(false);
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [state, loading]);

  const performSinglePull = useCallback((bannerType: BannerType, isFree: boolean = false, bannerId: string = 'standard'): GachaPullResult => {
    let grade: Grade = 'R';
    let pityTriggered = false;

    // Hard Pity Check
    if (state.urPityCounter + 1 >= HARD_PITY.UR) {
      grade = 'UR';
      pityTriggered = true;
    } else if (state.ssrPityCounter + 1 >= HARD_PITY.SSR) {
      grade = 'SSR';
      pityTriggered = true;
    } else {
      // Soft Pity Rates
      let rates = { ...BASE_RATES };
      if (state.urPityCounter >= SOFT_PITY.UR.start) {
        rates.UR += (state.urPityCounter - SOFT_PITY.UR.start + 1) * SOFT_PITY.UR.increase;
      }
      if (state.ssrPityCounter >= SOFT_PITY.SSR.start) {
        rates.SSR += (state.ssrPityCounter - SOFT_PITY.SSR.start + 1) * SOFT_PITY.SSR.increase;
      }

      const random = Math.random() * 100;
      if (random < rates.UR) grade = 'UR';
      else if (random < rates.UR + rates.SSR) grade = 'SSR';
      else if (random < rates.UR + rates.SSR + rates.SR) grade = 'SR';
      else grade = 'R';
    }

    // Filter pool
    let pool = allCards.filter(c => c.grade === grade);
    if (pool.length === 0) pool = allCards;

    const selectedCard = pool[Math.floor(Math.random() * pool.length)];
    const isNewCard = !state.ownedCards.some(oc => oc.id === selectedCard.id);

    const newOwnedCard: OwnedCard = {
      ...selectedCard,
      instanceId: Math.random().toString(36).substring(2, 11),
      acquiredAt: Date.now(),
      pullCount: state.totalPulls + 1,
      fromBanner: bannerType,
    };

    // Update Counters
    const nextURPity = grade === 'UR' ? 0 : state.urPityCounter + 1;
    const nextSSRPity = (grade === 'UR' || grade === 'SSR') ? 0 : state.ssrPityCounter + 1;
    const pointsEarned = SPARK_POINTS_PER_PULL[grade];

    setState(prev => ({
      ...prev,
      ownedCards: [...prev.ownedCards, newOwnedCard],
      totalPulls: prev.totalPulls + 1,
      urPityCounter: nextURPity,
      ssrPityCounter: nextSSRPity,
      sparkPoints: {
        ...prev.sparkPoints,
        [bannerId]: (prev.sparkPoints[bannerId] || 0) + pointsEarned
      },
      pullHistory: [{
        pullNumber: prev.totalPulls + 1,
        card: newOwnedCard,
        banner: bannerType,
        timestamp: Date.now(),
        currencySpent: isFree ? 0 : PULL_COSTS.SINGLE
      }, ...prev.pullHistory].slice(0, 100)
    }));

    return {
      card: newOwnedCard,
      isRateUp: false,
      isNewCard,
      pityTriggered,
      isDuplicate: !isNewCard
    };
  }, [allCards, state.ownedCards, state.urPityCounter, state.ssrPityCounter, state.totalPulls]);

  // COMPLETE IMPLEMENTATION OF pullCard using functional update
  const pullCardComplete = useCallback((bannerType: BannerType, count: number): GachaPullResult[] => {
    const cost = count === 10 ? PULL_COSTS.TEN : PULL_COSTS.SINGLE;
    if (state.currency < cost) {
      alert('Not enough coins!');
      return [];
    }

    const results: GachaPullResult[] = [];
    let currentURPity = state.urPityCounter;
    let currentSSRPity = state.ssrPityCounter;
    let currentTotalPulls = state.totalPulls;
    let currentSparkPoints = { ...state.sparkPoints };
    let newOwnedCards: OwnedCard[] = [];
    let newHistory: PullHistoryEntry[] = [];

    for (let i = 0; i < count; i++) {
        let grade: Grade = 'R';
        let pityTriggered = false;

        if (currentURPity + 1 >= HARD_PITY.UR) {
            grade = 'UR';
            pityTriggered = true;
        } else if (currentSSRPity + 1 >= HARD_PITY.SSR) {
            grade = 'SSR';
            pityTriggered = true;
        } else {
            let rates = { ...BASE_RATES };
            if (currentURPity >= SOFT_PITY.UR.start) rates.UR += (currentURPity - SOFT_PITY.UR.start + 1) * SOFT_PITY.UR.increase;
            if (currentSSRPity >= SOFT_PITY.SSR.start) rates.SSR += (currentSSRPity - SOFT_PITY.SSR.start + 1) * SOFT_PITY.SSR.increase;

            const random = Math.random() * 100;
            if (random < rates.UR) grade = 'UR';
            else if (random < rates.UR + rates.SSR) grade = 'SSR';
            else if (random < rates.UR + rates.SSR + rates.SR) grade = 'SR';
            else grade = 'R';
        }

        let pool = allCards.filter(c => c.grade === grade);
        if (pool.length === 0) pool = allCards;
        const selectedCard = pool[Math.floor(Math.random() * pool.length)];
        const isNewCard = !state.ownedCards.some(oc => oc.id === selectedCard.id) && !newOwnedCards.some(oc => oc.id === selectedCard.id);

        const newOwnedCard: OwnedCard = {
            ...selectedCard,
            instanceId: Math.random().toString(36).substring(2, 11),
            acquiredAt: Date.now(),
            pullCount: currentTotalPulls + 1,
            fromBanner: bannerType,
        };

        currentURPity = grade === 'UR' ? 0 : currentURPity + 1;
        currentSSRPity = (grade === 'UR' || grade === 'SSR') ? 0 : currentSSRPity + 1;
        currentTotalPulls++;
        const points = SPARK_POINTS_PER_PULL[grade];
        currentSparkPoints[state.currentBannerId] = (currentSparkPoints[state.currentBannerId] || 0) + points;

        newOwnedCards.push(newOwnedCard);
        newHistory.push({
            pullNumber: currentTotalPulls,
            card: newOwnedCard,
            banner: bannerType,
            timestamp: Date.now(),
            currencySpent: count === 10 ? PULL_COSTS.TEN / 10 : PULL_COSTS.SINGLE
        });

        results.push({
            card: newOwnedCard,
            isRateUp: false,
            isNewCard,
            pityTriggered,
            isDuplicate: !isNewCard
        });
    }

    setState(prev => ({
        ...prev,
        currency: prev.currency - cost,
        ownedCards: [...prev.ownedCards, ...newOwnedCards],
        totalPulls: currentTotalPulls,
        urPityCounter: currentURPity,
        ssrPityCounter: currentSSRPity,
        sparkPoints: currentSparkPoints,
        pullHistory: [...newHistory, ...prev.pullHistory].slice(0, 100)
    }));

    return results;
  }, [allCards, state.currency, state.urPityCounter, state.ssrPityCounter, state.totalPulls, state.sparkPoints, state.ownedCards, state.currentBannerId]);

  const claimFreePull = useCallback((): GachaPullResult | null => {
    const now = Date.now();
    const COOL_DOWN = 24 * 60 * 60 * 1000;
    if (state.lastFreePull && now - state.lastFreePull < COOL_DOWN) {
      alert('Free pull not available yet!');
      return null;
    }

    const res = performSinglePull('standard', true, state.currentBannerId);
    setState(prev => ({ ...prev, lastFreePull: now }));
    return res;
  }, [state.lastFreePull, state.currentBannerId, performSinglePull]);

  const claimDailyBonus = useCallback(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (state.lastDailyBonus && state.lastDailyBonus >= today) {
      return { coins: 0, streakDay: state.dailyStreak, message: "Already claimed today!" };
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
      coins: amount,
      streakDay: newStreak,
      message: `Claimed ${amount} coins! ${newStreak === 7 ? '7-day streak bonus!' : `Streak: ${newStreak} days`}`
    };
  }, [state.lastDailyBonus, state.dailyStreak]);

  const convertDuplicates = useCallback(() => {
    const seen = new Set<string>();
    const uniqueCards: OwnedCard[] = [];
    let coinsGained = 0;
    let cardsRemoved = 0;

    // Sorting by acquiredAt ensures we keep the oldest copy if we want, or just any copy.
    state.ownedCards.forEach(card => {
       if (!seen.has(card.id)) {
         seen.add(card.id);
         uniqueCards.push(card);
       } else {
         coinsGained += DUPLICATE_REWARDS[card.grade as Grade || 'R'];
         cardsRemoved++;
       }
    });

    setState(prev => ({
      ...prev,
      ownedCards: uniqueCards,
      currency: prev.currency + coinsGained
    }));

    return { cardsRemoved, coinsGained };
  }, [state.ownedCards]);

  const sparkCard = useCallback((bannerId: string, cardId: string): OwnedCard | null => {
    const points = state.sparkPoints[bannerId] || 0;
    if (points < SPARK_COST) {
       alert(`Need ${SPARK_COST} Spark Points!`);
       return null;
    }

    const card = allCards.find(c => c.id === cardId);
    if (!card) return null;

    const newOwnedCard: OwnedCard = {
      ...card,
      instanceId: Math.random().toString(36).substring(2, 11),
      acquiredAt: Date.now(),
      pullCount: state.totalPulls,
      fromBanner: 'standard',
    };

    setState(prev => ({
      ...prev,
      ownedCards: [...prev.ownedCards, newOwnedCard],
      sparkPoints: {
        ...prev.sparkPoints,
        [bannerId]: points - SPARK_COST
      }
    }));

    return newOwnedCard;
  }, [allCards, state.sparkPoints, state.totalPulls]);

  const setActiveBanner = useCallback((bannerId: string) => {
    setState(prev => ({
      ...prev,
      currentBannerId: bannerId,
      // Task said: Resets spark points when switching banners?
      // Requirement: "Spark Points are per-banner — they reset when banner changes"
      // But state has Record<string, number>. Usually resetting means clearing the points for the NEW banner?
      // Or clearing points for ALL banners? "resets when banner changes" usually means
      // the points you earned on Banner A don't apply to Banner B.
      // If they reset entirely, then:
      sparkPoints: {}
    }));
  }, []);

  const exportCollection = useCallback(() => {
    return JSON.stringify(state);
  }, [state]);

  const importCollection = useCallback((data: string) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.version && parsed.ownedCards) {
        setState(parsed);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }, []);

  return (
    <CollectionContext.Provider
      value={{
        allCards,
        state,
        loading,
        isSaving,
        pullCard: pullCardComplete,
        claimFreePull,
        claimDailyBonus,
        convertDuplicates,
        sparkCard,
        setActiveBanner,
        exportCollection,
        importCollection,
        refreshData: loadData
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
}

export function useCollection() {
  const context = useContext(CollectionContext);
  if (context === undefined) {
    throw new Error('useCollection must be used within a CollectionProvider');
  }
  return context;
}
