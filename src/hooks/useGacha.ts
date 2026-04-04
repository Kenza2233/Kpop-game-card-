'use client';

import { useState, useCallback } from 'react';
import {
  Grade,
  GachaPullResult,
  OwnedCard,
  BannerType,
  BASE_RATES,
  SOFT_PITY,
  HARD_PITY,
  PULL_COSTS,
  SPARK_COST,
  KpopCard
} from '../lib/types';
import { useGame } from '../context/GameContext';

export function useGacha() {
  const { allCards, state, addOwnedCard, updateCurrency, incrementPity, resetPity, claimFreePull, sparkCard: sparkInContext } = useGame();
  const [isPulling, setIsPulling] = useState(false);
  const [lastResults, setLastResults] = useState<GachaPullResult[] | null>(null);

  const calculateSoftPity = (currentCount: number, grade: 'UR' | 'SSR'): number => {
    const config = SOFT_PITY[grade];
    if (currentCount < config.start) return 0;
    return (currentCount - config.start + 1) * config.increase;
  };

  const getPullRates = useCallback((bannerType: BannerType, pullCountUR: number, pullCountSSR: number) => {
    let rates = { ...BASE_RATES };

    if (bannerType === 'newcomer') {
      rates.UR = 0.3;
      rates.SR = 40.0;
      rates.SSR = 4.5;
      rates.R = 100 - (rates.UR + rates.SSR + rates.SR);
    }

    // Apply Soft Pity
    rates.UR += calculateSoftPity(pullCountUR, 'UR');
    rates.SSR += calculateSoftPity(pullCountSSR, 'SSR');

    // Clamp total to 100%
    const totalHighRarity = rates.UR + rates.SSR;
    if (totalHighRarity > 100) {
      rates.UR = (rates.UR / totalHighRarity) * 100;
      rates.SSR = (rates.SSR / totalHighRarity) * 100;
      rates.SR = 0;
      rates.R = 0;
    } else if (totalHighRarity + rates.SR > 100) {
      rates.SR = 100 - totalHighRarity;
      rates.R = 0;
    } else {
      rates.R = 100 - (totalHighRarity + rates.SR);
    }

    return rates;
  }, []);

  const performSinglePull = useCallback((bannerId: string, bannerType: BannerType, isFree: boolean): GachaPullResult => {
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
      const rates = getPullRates(bannerType, state.urPityCounter, state.ssrPityCounter);
      const random = Math.random() * 100;

      if (random < rates.UR) grade = 'UR';
      else if (random < rates.UR + rates.SSR) grade = 'SSR';
      else if (random < rates.UR + rates.SSR + rates.SR) grade = 'SR';
      else grade = 'R';
    }

    // Filter cards by grade and banner
    let pool = allCards.filter(c => c.grade === grade);

    if (bannerType === 'newcomer') {
        const currentYear = new Date().getFullYear();
        pool = pool.filter(c => (currentYear - c.year) <= 2);
    }

    // Fallback if pool is empty
    if (pool.length === 0) pool = allCards.filter(c => c.grade === grade);
    if (pool.length === 0) pool = allCards; // Absolute fallback

    // Featured Logic (Simplified: 50% chance for rate up if UR/SSR)
    let isRateUp = false;
    // (Assuming bannerId identifies a featured banner and we have rateUpCards somewhere,
    // for now we'll just pick a random card from pool)

    const selectedCard = pool[Math.floor(Math.random() * pool.length)];
    const isNewCard = !state.ownedCards.some(oc => oc.id === selectedCard.id);

    const { isDuplicate, coinReward } = addOwnedCard(selectedCard, bannerId, isFree ? 0 : PULL_COSTS.SINGLE);

    // Update pity counters
    if (grade === 'UR') {
      resetPity('UR');
      resetPity('SSR');
    } else if (grade === 'SSR') {
      resetPity('SSR');
      incrementPity('UR');
    } else {
      incrementPity('UR');
      incrementPity('SSR');
    }

    return {
      card: {
        ...selectedCard,
        instanceId: Math.random().toString(36).substring(2, 11),
        acquiredAt: Date.now(),
        pullCount: state.totalPulls + 1,
        fromBanner: bannerType
      },
      isRateUp,
      isNewCard,
      pityTriggered,
      isDuplicate,
      coinReward
    };
  }, [allCards, state, addOwnedCard, incrementPity, resetPity, getPullRates]);

  const pullSingle = useCallback(async (bannerId: string, bannerType: BannerType, isFree: boolean = false) => {
    if (isPulling) return;

    if (!isFree && state.currency < PULL_COSTS.SINGLE) {
      alert("Not enough coins!");
      return;
    }

    if (isFree && !claimFreePull()) {
      alert("Free pull not available yet!");
      return;
    }

    setIsPulling(true);
    if (!isFree) updateCurrency(-PULL_COSTS.SINGLE);

    // Delay for effect
    await new Promise(resolve => setTimeout(resolve, 1500));

    const result = performSinglePull(bannerId, bannerType, isFree);
    setLastResults([result]);
    setIsPulling(false);
  }, [isPulling, state.currency, performSinglePull, updateCurrency, claimFreePull]);

  const pullTen = useCallback(async (bannerId: string, bannerType: BannerType) => {
    if (isPulling) return;

    if (state.currency < PULL_COSTS.TEN) {
      alert("Not enough coins!");
      return;
    }

    setIsPulling(true);
    updateCurrency(-PULL_COSTS.TEN);

    await new Promise(resolve => setTimeout(resolve, 3000));

    const results: GachaPullResult[] = [];
    for (let i = 0; i < 10; i++) {
      results.push(performSinglePull(bannerId, bannerType, false));
    }

    setLastResults(results);
    setIsPulling(false);
  }, [isPulling, state.currency, performSinglePull, updateCurrency]);

  const canSpark = (bannerId: string) => {
    return (state.sparkPoints[bannerId] || 0) >= SPARK_COST;
  };

  const sparkCard = (bannerId: string, card: KpopCard) => {
    return sparkInContext(bannerId, card);
  };

  return {
    pullSingle,
    pullTen,
    isPulling,
    lastResults,
    setLastResults,
    getPullRates,
    canSpark,
    sparkCard,
    calculateSoftPity
  };
}
