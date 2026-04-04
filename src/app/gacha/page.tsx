'use client';

import { useCollection } from '@/context/CollectionContext';
import { useBanner } from '@/hooks/useBanner';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { GachaMachine } from '@/components/GachaMachine';
import { getTimeUntilReset } from '@/lib/cardUtils';
import { useState, useEffect } from 'react';

export default function GachaPage() {
  const { state, pullCard, claimFreePull } = useCollection();
  const { banners, currentBanner, setActiveBannerId } = useBanner();
  const [timer, setTimer] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(getTimeUntilReset(state.lastFreePull));
    }, 1000);
    return () => clearInterval(interval);
  }, [state.lastFreePull]);

  const canFreePull = !state.lastFreePull || (Date.now() - state.lastFreePull >= 24 * 60 * 60 * 1000);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Header currency={state.currency} totalCards={state.ownedCards.length} sparkPoints={currentBanner ? (state.sparkPoints[currentBanner.id] || 0) : 0} />

      <div className="max-w-7xl mx-auto pt-8 px-6">
         <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
            <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase">Gacha Center</h1>

            {/* Banner Selector */}
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
               {banners.map((b) => (
                 <button
                   key={b.id}
                   onClick={() => setActiveBannerId(b.id)}
                   className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                     currentBanner?.id === b.id
                       ? 'bg-primary text-white shadow-lg'
                       : 'text-white/20 hover:text-white/40'
                   }`}
                 >
                   {b.name}
                 </button>
               ))}
            </div>
         </div>

         {currentBanner && (
           <GachaMachine
              banner={currentBanner}
              onPull={(count) => pullCard(currentBanner, count)}
              onFreePull={() => claimFreePull(currentBanner)}
              currency={state.currency}
              pityCounters={{ ur: state.urPityCounter, ssr: state.ssrPityCounter }}
              sparkPoints={state.sparkPoints[currentBanner.id] || 0}
              canFreePull={canFreePull}
              freePullTimer={timer}
              pullHistory={[]}
           />
         )}
      </div>

      <MobileNav />
    </div>
  );
}
