'use client';

import { useState, useCallback } from 'react';
import { Grade, GachaPullResult, OwnedCard, BannerType } from '../lib/types';
import { useGame } from '../context/GameContext';
import { getRandomGrade } from '../lib/cardUtils';

const PULL_COST = 100;

export function useGacha() {
  const { allCards, state, addOwnedCard, updateCurrency, incrementPity, resetPity } = useGame();
  const [isPulling, setIsPulling] = useState(false);
  const [lastResult, setLastResult] = useState<GachaPullResult | null>(null);

  const pull = useCallback(async () => {
    if (allCards.length === 0 || isPulling) return null;

    if (state.currency < PULL_COST) {
      alert("Not enough credits!");
      return null;
    }

    setIsPulling(true);
    setLastResult(null);

    // Artificial delay for gacha animation
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Handle Pity
    let grade: Grade = getRandomGrade();
    let pityTriggered = false;

    if (state.urPityCounter >= 49) { // 50-pull hard pity for UR
      grade = 'UR';
      pityTriggered = true;
    } else if (state.ssrPityCounter >= 19 && grade !== 'UR') { // 20-pull pity for SSR
      grade = 'SSR';
      pityTriggered = true;
    }

    const cardsOfGrade = allCards.filter(c => c.grade === grade);
    const finalCards = cardsOfGrade.length > 0 ? cardsOfGrade : allCards;
    const selectedCard = finalCards[Math.floor(Math.random() * finalCards.length)];

    // Check if new
    const isNewCard = !state.ownedCards.some(oc => oc.id === selectedCard.id);

    // Update state
    updateCurrency(-PULL_COST);

    // Manage pity counters
    if (grade === 'UR') {
      resetPity('UR');
      resetPity('SSR'); // Getting UR resets SSR pity
    } else if (grade === 'SSR') {
      incrementPity('UR');
      resetPity('SSR');
    } else {
      incrementPity('UR');
      incrementPity('SSR');
    }

    // Add to collection
    const banner = state.currentBanner as BannerType;
    const newOwnedCard: OwnedCard = {
      ...selectedCard,
      instanceId: Math.random().toString(36).substr(2, 9),
      acquiredAt: Date.now(),
      pullCount: state.totalPulls + 1,
      fromBanner: banner,
    };

    addOwnedCard(selectedCard, state.currentBanner, PULL_COST);

    const result: GachaPullResult = {
      card: newOwnedCard,
      isRateUp: false, // Simple logic for now
      isNewCard,
      pityTriggered,
    };

    setLastResult(result);
    setIsPulling(false);

    return result;
  }, [allCards, isPulling, state, addOwnedCard, updateCurrency, incrementPity, resetPity]);

  return { pull, isPulling, lastResult, setLastResult, PULL_COST };
}
