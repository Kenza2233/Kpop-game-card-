'use client';

import { GachaMachine } from '@/components/GachaMachine';
import { Header } from '@/components/Header';
import { useCollection } from '@/context/CollectionContext';
import { useBanner } from '@/hooks/useBanner';
import { getTimeUntilReset } from '@/lib/cardUtils';
import { useState, useEffect } from 'react';

export default function Home() {
  const { state, pullCard, claimFreePull } = useCollection();
  const { currentBanner } = useBanner();
  const [timer, setTimer] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(getTimeUntilReset(state.lastFreePull));
    }, 1000);
    return () => clearInterval(interval);
  }, [state.lastFreePull]);

  const canFreePull = !state.lastFreePull || (Date.now() - state.lastFreePull >= 24 * 60 * 60 * 1000);

  return (
    <div className="min-h-screen bg-background">
      <Header
        currency={state.currency}
        totalCards={state.ownedCards.length}
        sparkPoints={state.sparkPoints[currentBanner?.id] || 0}
      />

      <main className="container mx-auto py-8">
        {currentBanner && (
          <GachaMachine
            banner={currentBanner}
            onPull={(count) => pullCard(currentBanner.type, count)}
            currency={state.currency}
            pityCounters={{ ur: state.urPityCounter, ssr: state.ssrPityCounter }}
            sparkPoints={state.sparkPoints[currentBanner.id] || 0}
            canFreePull={canFreePull}
            freePullTimer={timer}
            pullHistory={state.pullHistory.slice(0, 10).map(p => ({
               card: p.card,
               isRateUp: false,
               isNewCard: false,
               pityTriggered: false,
               isDuplicate: false
            }))}
          />
        )}
      </main>
    </div>
  );
}
