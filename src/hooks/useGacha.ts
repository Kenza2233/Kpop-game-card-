'use client';

import { useState, useCallback } from 'react';
import { Card, Rarity, RARITY_WEIGHTS } from '../lib/types';
import { useGame } from '../context/GameContext';

const PULL_COST = 100;

export function useGacha() {
  const { allCards, spendCredits, addCardToCollection } = useGame();
  const [isPulling, setIsPulling] = useState(false);
  const [pulledCard, setPulledCard] = useState<Card | null>(null);

  const getRandomRarity = (): Rarity => {
    const totalWeight = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
    let random = Math.floor(Math.random() * totalWeight);

    for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
      if (random < weight) {
        return rarity as Rarity;
      }
      random -= weight;
    }

    return 'Common';
  };

  const pull = useCallback(async () => {
    if (allCards.length === 0 || isPulling) return null;

    if (!spendCredits(PULL_COST)) {
      alert("Not enough credits!");
      return null;
    }

    setIsPulling(true);
    setPulledCard(null);

    // Artificial delay for gacha animation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const rarity = getRandomRarity();
    const cardsOfRarity = allCards.filter(c => c.rarity === rarity);

    // Fallback if no cards of selected rarity exist
    const finalCards = cardsOfRarity.length > 0 ? cardsOfRarity : allCards;
    const selectedCard = finalCards[Math.floor(Math.random() * finalCards.length)];

    addCardToCollection(selectedCard);
    setPulledCard(selectedCard);
    setIsPulling(false);

    return selectedCard;
  }, [allCards, isPulling, spendCredits, addCardToCollection]);

  return { pull, isPulling, pulledCard, setPulledCard, PULL_COST };
}
