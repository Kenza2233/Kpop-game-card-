'use client';

import { useState, useCallback } from 'react';
import { Card, GRADE_WEIGHTS, Grade } from '../lib/types';
import { useGame } from '../context/GameContext';

const PULL_COST = 100;

export function useGacha() {
  const { allCards, spendCredits, addCardToCollection } = useGame();
  const [isPulling, setIsPulling] = useState(false);
  const [pulledCard, setPulledCard] = useState<Card | null>(null);

  const getRandomGrade = (): Grade => {
    const totalWeight = Object.values(GRADE_WEIGHTS).reduce((a, b) => a + b, 0);
    let random = Math.floor(Math.random() * totalWeight);

    for (const [grade, weight] of Object.entries(GRADE_WEIGHTS)) {
      if (random < weight) {
        return grade as Grade;
      }
      random -= weight;
    }

    return 'R';
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

    const grade = getRandomGrade();
    const cardsOfGrade = allCards.filter(c => c.grade === grade);

    // Fallback if no cards of selected grade exist
    const finalCards = cardsOfGrade.length > 0 ? cardsOfGrade : allCards;
    const selectedCard = finalCards[Math.floor(Math.random() * finalCards.length)];

    addCardToCollection(selectedCard);
    setPulledCard(selectedCard);
    setIsPulling(false);

    return selectedCard;
  }, [allCards, isPulling, spendCredits, addCardToCollection]);

  return { pull, isPulling, pulledCard, setPulledCard, PULL_COST };
}
