'use client';

import { useCollection } from '@/context/CollectionContext';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { PullHistory } from '@/components/PullHistory';
import { CardModal } from '@/components/CardModal';
import { useState, useMemo } from 'react';
import { OwnedCard } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, AlertCircle } from 'lucide-react';

export default function HistoryPage() {
  const { state } = useCollection();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const selectedCard = useMemo(() => {
    if (!selectedCardId) return null;
    return state.ownedCards.find(c => c.id === selectedCardId) || null;
  }, [selectedCardId, state.ownedCards]);

  const stats = useMemo(() => {
    const total = state.pullHistory.length || 1;
    const ur = state.pullHistory.filter(p => p.card.grade === 'UR').length;
    const ssr = state.pullHistory.filter(p => p.card.grade === 'SSR').length;
    const sr = state.pullHistory.filter(p => p.card.grade === 'SR').length;

    return {
      urRate: (ur / total) * 100,
      ssrRate: (ssr / total) * 100,
      srRate: (sr / total) * 100,
    };
  }, [state.pullHistory]);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Header currency={state.currency} totalCards={state.ownedCards.length} sparkPoints={0} />

      <div className="max-w-7xl mx-auto pt-8 px-6 mb-24">
         <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
            <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase">Pull Logs</h1>

            <div className="flex items-center gap-6">
               <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Expected UR</span>
                  <span className="text-sm font-black text-white">0.50%</span>
               </div>
               <div className="w-px h-8 bg-white/10" />
               <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Actual UR</span>
                  <span className={`text-sm font-black ${stats.urRate > 0.5 ? 'text-emerald-400' : 'text-primary'}`}>
                    {stats.urRate.toFixed(2)}%
                  </span>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
               <PullHistory history={state.pullHistory} onCardClick={(id) => setSelectedCardId(id)} />
            </div>
            <aside className="lg:col-span-4 space-y-6">
               <div className="bg-white/5 border border-white/5 rounded-[40px] p-8 shadow-2xl">
                  <div className="flex items-center gap-3 mb-8">
                     <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <BarChart3 className="w-5 h-5" />
                     </div>
                     <h3 className="text-sm font-black text-white uppercase tracking-widest">Rate Analysis</h3>
                  </div>

                  <div className="space-y-6">
                     <RateProgress label="UR Cards" actual={stats.urRate} expected={0.5} color="bg-yellow-400" />
                     <RateProgress label="SSR Cards" actual={stats.ssrRate} expected={4.5} color="bg-purple-400" />
                     <RateProgress label="SR Cards" actual={stats.srRate} expected={30.0} color="bg-blue-400" />
                  </div>

                  <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/5 flex gap-4">
                     <AlertCircle className="w-5 h-5 text-white/20 flex-shrink-0" />
                     <p className="text-[10px] font-medium text-white/40 leading-relaxed uppercase tracking-wider">
                        Rates are calculated based on your entire pull history. Pity triggers significantly impact actual rates.
                     </p>
                  </div>
               </div>
            </aside>
         </div>
      </div>

      <AnimatePresence>
        {selectedCard && (
           <CardModal
             card={selectedCard as OwnedCard}
             onClose={() => setSelectedCardId(null)}
             ownedCopies={state.ownedCards.filter(c => c.id === selectedCard.id).length}
           />
        )}
      </AnimatePresence>

      <MobileNav />
    </div>
  );
}

function RateProgress({ label, actual, expected, color }: { label: string, actual: number, expected: number, color: string }) {
  const ratio = Math.min((actual / expected) * 100, 100);

  return (
    <div className="space-y-2">
       <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
          <span className="text-white/40">{label}</span>
          <span className="text-white">{actual.toFixed(2)}%</span>
       </div>
       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${ratio}%` }}
            className={`h-full rounded-full ${color}`}
          />
       </div>
    </div>
  );
}
