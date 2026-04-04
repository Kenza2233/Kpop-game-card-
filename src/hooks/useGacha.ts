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
  SPARK_POINTS_PER_PULL,
  KpopCard,
  Banner
} from '../lib/types';
import { generateInstanceId } from '../lib/cardUtils';

export function useGacha() {
  const calculateSoftPity = useCallback((currentCount: number, grade: 'UR' | 'SSR'): number => {
    const config = SOFT_PITY[grade];
    if (currentCount < config.start) return 0;
    return (currentCount - config.start + 1) * config.increase;
  }, []);

  const getPullRates = useCallback((pullCountUR: number, pullCountSSR: number) => {
    let rates = { ...BASE_RATES };

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
  }, [calculateSoftPity]);

  const pullSingle = useCallback((
    banner: Banner,
    allCards: KpopCard[],
    pityState: { urCounter: number; ssrCounter: number },
    forceSRPlus: boolean = false
  ): GachaPullResult => {
    let grade: Grade = 'R';
    let pityTriggered = false;

    // Hard Pity Check
    if (pityState.urCounter + 1 >= HARD_PITY.UR) {
      grade = 'UR';
      pityTriggered = true;
    } else if (pityState.ssrCounter + 1 >= HARD_PITY.SSR) {
      grade = 'SSR';
      pityTriggered = true;
    } else {
      const rates = getPullRates(pityState.urCounter, pityState.ssrCounter);
      const random = Math.random() * 100;

      if (random < rates.UR) grade = 'UR';
      else if (random < rates.UR + rates.SSR) grade = 'SSR';
      else if (random < rates.UR + rates.SSR + rates.SR) grade = 'SR';
      else grade = 'R';
    }

    // Force SR+ for 10-pull guarantee if needed
    if (forceSRPlus && grade === 'R') {
       const random = Math.random() * 35; // Weighted toward SR (30%) vs SSR (4.5%) vs UR (0.5%)
       if (random < 30) grade = 'SR';
       else if (random < 34.5) grade = 'SSR';
       else grade = 'UR';
    }

    let pool = allCards.filter(c => c.grade === grade);
    if (pool.length === 0) pool = allCards; // Absolute fallback

    // Featured Logic: 50% chance for rate-up if UR/SSR
    let isRateUp = false;
    if (banner.type === 'featured' && (grade === 'UR' || grade === 'SSR') && banner.rateUpCards) {
        if (Math.random() < 0.5) {
            const rateUpPool = pool.filter(c => banner.rateUpCards?.includes(c.id));
            if (rateUpPool.length > 0) {
                pool = rateUpPool;
                isRateUp = true;
            }
        }
    }

    const selectedCard = pool[Math.floor(Math.random() * pool.length)];

    const newOwnedCard: OwnedCard = {
      ...selectedCard,
      instanceId: generateInstanceId(),
      acquiredAt: Date.now(),
      pullCount: 0, // Will be set by context
      fromBanner: banner.type,
    };

    return {
      card: newOwnedCard,
      isRateUp,
      isNewCard: false, // Will be determined by context
      pityTriggered,
      isDuplicate: false, // Will be determined by context
    };
  }, [getPullRates]);

  const pullTen = useCallback((
    banner: Banner,
    allCards: KpopCard[],
    pityState: { urCounter: number; ssrCounter: number }
  ): GachaPullResult[] => {
    const results: GachaPullResult[] = [];
    let hasSRPlus = false;
    let currentURPity = pityState.urCounter;
    let currentSSRPity = pityState.ssrCounter;

    for (let i = 0; i < 10; i++) {
        // Force SR+ on 10th pull if none in first 9
        const forceSRPlus = i === 9 && !hasSRPlus;

        const result = pullSingle(banner, allCards, { urCounter: currentURPity, ssrCounter: currentSSRPity }, forceSRPlus);

        if (result.card.grade !== 'R') hasSRPlus = true;

        // Update local pity tracking for this batch
        if (result.card.grade === 'UR') {
            currentURPity = 0;
            currentSSRPity = 0;
        } else if (result.card.grade === 'SSR') {
            currentURPity++;
            currentSSRPity = 0;
        } else {
            currentURPity++;
            currentSSRPity++;
        }

        results.push(result);
    }

    return results;
  }, [pullSingle]);

  return {
    pullSingle,
    pullTen,
    calculateSoftPity,
    getPullRates
  };
}
