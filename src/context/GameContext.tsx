'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Card, UserCard, UserStats } from '../lib/types';

interface GameContextType {
  allCards: Card[];
  userStats: UserStats;
  loading: boolean;
  addCardToCollection: (card: Card) => void;
  spendCredits: (amount: number) => boolean;
  addCredits: (amount: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const INITIAL_STATS: UserStats = {
  credits: 1000,
  collection: [],
};

export function GameProvider({ children }: { children: ReactNode }) {
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [userStats, setUserStats] = useState<UserStats>(INITIAL_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage
    const savedStats = localStorage.getItem('kpop_gacha_stats');
    if (savedStats) {
      setUserStats(JSON.parse(savedStats));
    }

    // Fetch cards data
    const fetchCards = async () => {
      try {
        const response = await fetch('/data/kpop_data.json');
        if (!response.ok) {
          throw new Error('Failed to fetch card data');
        }
        const data = await response.json();
        setAllCards(data.cards || []);
      } catch (error) {
        console.error('Error loading cards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('kpop_gacha_stats', JSON.stringify(userStats));
    }
  }, [userStats, loading]);

  const addCardToCollection = (card: Card) => {
    const newUserCard: UserCard = {
      ...card,
      instanceId: Math.random().toString(36).substr(2, 9),
      obtainedAt: Date.now(),
    };
    setUserStats(prev => ({
      ...prev,
      collection: [...prev.collection, newUserCard],
    }));
  };

  const spendCredits = (amount: number): boolean => {
    if (userStats.credits >= amount) {
      setUserStats(prev => ({
        ...prev,
        credits: prev.credits - amount,
      }));
      return true;
    }
    return false;
  };

  const addCredits = (amount: number) => {
    setUserStats(prev => ({
      ...prev,
      credits: prev.credits + amount,
    }));
  };

  return (
    <GameContext.Provider
      value={{
        allCards,
        userStats,
        loading,
        addCardToCollection,
        spendCredits,
        addCredits,
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
