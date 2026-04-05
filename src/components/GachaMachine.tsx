'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Coins, Info, Clock, ChevronDown, ChevronUp, History, X } from 'lucide-react';
import { Banner, GachaPullResult, HARD_PITY, SOFT_PITY, PULL_COSTS, SPARK_COST, DUPLICATE_REWARDS, Grade } from '../lib/types';
import { KpopCardComponent } from './KpopCard';
import { useCardCollection } from '@/hooks/useCardCollection';
import { useCollection } from '@/context/CollectionContext';

interface GachaMachineProps {
  banner: Banner;
  onPull: (count: number) => GachaPullResult[];
  onFreePull: () => GachaPullResult | null;
  currency: number;
  pityCounters: { ur: number; ssr: number };
  sparkPoints: number;
  canFreePull: boolean;
  freePullTimer: string;
  pullHistory: any[];
}

export function GachaMachine({
  banner,
  onPull,
  onFreePull,
  currency,
  pityCounters,
  sparkPoints,
  canFreePull,
  freePullTimer,
}: GachaMachineProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [results, setResults] = useState<GachaPullResult[] | null>(null);
  const [revealedIndex, setRevealedIndex] = useState(-1);
  const [showMobileStats, setShowMobileStats] = useState(false);
  const [showSparkShop, setShowSparkShop] = useState(false);
  const { cards: allCards } = useCardCollection();
  const { sparkCard } = useCollection();

  const handlePull = async (count: number) => {
    if (isPulling) return;

    setIsPulling(true);
    setResults(null);
    setRevealedIndex(-1);

    await new Promise(r => setTimeout(r, 1000));

    const newResults = onPull(count);
    if (newResults.length === 0) {
      setIsPulling(false);
      return;
    }

    setResults(newResults);

    for (let i = 0; i < newResults.length; i++) {
        setRevealedIndex(i);
        await new Promise(r => setTimeout(r, 800));
    }
  };

  const handleFreePull = async () => {
    if (isPulling || !canFreePull) return;

    setIsPulling(true);
    setResults(null);
    setRevealedIndex(-1);

    await new Promise(r => setTimeout(r, 1000));

    const res = onFreePull();
    if (!res) {
      setIsPulling(false);
      return;
    }

    setResults([res]);
    setRevealedIndex(0);
  };

  const currentRevealed = useMemo(() => {
    if (!results || revealedIndex === -1) return null;
    return results[revealedIndex];
  }, [results, revealedIndex]);

  const closeResults = () => {
    setIsPulling(false);
    setResults(null);
    setRevealedIndex(-1);
  };

  const rateUpCardsData = useMemo(() => {
    if (!banner.rateUpCards) return [];
    return banner.rateUpCards.map(id => allCards.find(c => c.id === id)).filter(Boolean);
  }, [banner.rateUpCards, allCards]);

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-10 gap-8 relative">

      {/* Left Panel: Banner Info (40%) */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative aspect-[16/9] rounded-3xl overflow-hidden group shadow-2xl border border-white/5"
        >
          <img
            src={banner.image}
            alt={banner.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
             <div className="flex items-center gap-2 mb-2">
                <span className="bg-primary px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20">
                   {banner.type}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-white/60 font-bold bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full">
                   <Clock className="w-3 h-3" />
                   Ends in: {banner.endDate}
                </div>
             </div>
             <h2 className="text-3xl font-black italic tracking-tighter text-white leading-none mb-2">
                {banner.name}
             </h2>
             <p className="text-white/60 text-xs font-medium max-w-sm">
                {banner.description}
             </p>
          </div>
        </motion.div>

        {rateUpCardsData.length > 0 && (
          <div className="bg-white/5 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
             <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-4">
                Rate-Up Cards
             </h3>
             <div className="grid grid-cols-4 gap-3">
                {rateUpCardsData.slice(0, 4).map(card => (
                   <div key={card?.id} className="aspect-[3/4] rounded-xl overflow-hidden border border-white/10 group relative">
                      <img src={card?.image} alt={card?.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                         <span className="text-[8px] font-black text-white truncate">{card?.name}</span>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}
      </div>

      {/* Center Panel: Pull Area (30%) */}
      <div className="lg:col-span-3 flex flex-col items-center justify-center gap-8 py-12">
         <div className="relative w-full max-w-[280px] aspect-[3/4] flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-[100px] animate-pulse" />
            <motion.div
               animate={isPulling ? {
                 rotate: [0, -5, 5, -5, 5, 0],
                 scale: [1, 1.05, 1, 1.05, 1],
               } : {}}
               transition={{ duration: 0.3, repeat: Infinity, repeatType: 'reverse' }}
               className="relative z-10 w-full h-full border-8 border-white/5 rounded-3xl bg-card-bg/40 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
            >
               <Sparkles className={`w-24 h-24 transition-colors duration-1000 ${isPulling ? 'text-primary' : 'text-white/10'}`} />
               <div className="mt-8">
                  <span className="text-white/20 text-xs font-black tracking-widest uppercase">
                     Gacha Machine
                  </span>
               </div>
            </motion.div>
         </div>

         <div className="w-full flex flex-col gap-3">
            <div className="flex gap-2">
               <button
                 onClick={() => handlePull(1)}
                 disabled={isPulling || currency < PULL_COSTS.SINGLE}
                 aria-label={`Single pull for ${PULL_COSTS.SINGLE} coins`}
                 className="flex-1 bg-white/5 hover:bg-white/10 disabled:opacity-50 border border-white/10 rounded-2xl py-4 flex flex-col items-center justify-center transition-all group focus:outline-none focus:ring-2 focus:ring-primary/50"
               >
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 group-hover:text-white/60">Single Pull</span>
                  <div className="flex items-center gap-1">
                     <Coins className="w-4 h-4 text-accent fill-accent/20" />
                     <span className="text-lg font-black text-white">{PULL_COSTS.SINGLE}</span>
                  </div>
               </button>
               <button
                 onClick={() => handlePull(10)}
                 disabled={isPulling || currency < PULL_COSTS.TEN}
                 aria-label={`Ten pull for ${PULL_COSTS.TEN} coins`}
                 className="flex-[2] bg-gradient-to-br from-primary to-accent rounded-2xl py-4 flex flex-col items-center justify-center shadow-xl shadow-primary/20 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/50"
               >
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Ten Pull</span>
                  <div className="flex items-center gap-1">
                     <Coins className="w-4 h-4 text-white fill-white/20" />
                     <span className="text-lg font-black text-white">{PULL_COSTS.TEN}</span>
                  </div>
               </button>
            </div>

            <button
               onClick={handleFreePull}
               disabled={!canFreePull || isPulling}
               className={`w-full border-2 rounded-2xl py-3 text-xs font-black uppercase tracking-widest transition-all ${
                 canFreePull && !isPulling
                   ? 'border-accent text-accent hover:bg-accent/10'
                   : 'border-white/5 text-white/20 cursor-not-allowed'
               }`}
            >
               {canFreePull ? 'CLAIM FREE DAILY PULL' : `NEXT FREE PULL: ${freePullTimer}`}
            </button>
         </div>
      </div>

      {/* Right Panel: Stats & Info (30%) */}
      <div className="lg:col-span-3 flex flex-col gap-6">
         <div className="hidden lg:flex flex-col gap-6">
            <StatCard
              label="UR Pity"
              current={pityCounters.ur}
              max={HARD_PITY.UR}
              color="#FFD700"
              approach={SOFT_PITY.UR.start}
            />
            <StatCard
              label="SSR Pity"
              current={pityCounters.ssr}
              max={HARD_PITY.SSR}
              color="#C084FC"
              approach={SOFT_PITY.SSR.start}
            />
            <div className="relative group">
              <StatCard
                label="Spark Points"
                current={sparkPoints}
                max={SPARK_COST}
                color="#A855F7"
              />
              {sparkPoints >= SPARK_COST && (
                <button
                  onClick={() => setShowSparkShop(true)}
                  className="absolute -top-2 -right-2 bg-accent text-black text-[10px] font-black px-3 py-1 rounded-full shadow-lg animate-bounce hover:scale-110 transition-transform"
                >
                  SPEND!
                </button>
              )}
            </div>
         </div>

         <button
           onClick={() => setShowMobileStats(!showMobileStats)}
           className="lg:hidden w-full bg-white/5 p-4 rounded-2xl flex items-center justify-between"
         >
            <span className="text-xs font-black uppercase tracking-widest text-white/60">Banner Statistics</span>
            {showMobileStats ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
         </button>
         {showMobileStats && (
            <div className="lg:hidden flex flex-col gap-4 p-2">
               <StatCard label="UR Pity" current={pityCounters.ur} max={HARD_PITY.UR} color="#FFD700" approach={SOFT_PITY.UR.start} />
               <StatCard label="SSR Pity" current={pityCounters.ssr} max={HARD_PITY.SSR} color="#C084FC" approach={SOFT_PITY.SSR.start} />
            </div>
         )}
      </div>

      <AnimatePresence>
        {showSparkShop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6"
          >
            <div className="bg-slate-900 border border-white/10 rounded-[40px] w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">Spark Shop</h2>
                  <p className="text-white/40 text-sm font-medium">Exchange {SPARK_COST} points for any card in the collection.</p>
                </div>
                <button
                  onClick={() => setShowSparkShop(false)}
                  className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {allCards.filter(c => c.grade === 'UR' || c.grade === 'SSR').map(card => (
                  <button
                    key={card.id}
                    onClick={() => {
                      if (confirm(`Exchange ${SPARK_COST} points for ${card.name}?`)) {
                        sparkCard(banner.id, card.id);
                        setShowSparkShop(false);
                      }
                    }}
                    className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all"
                  >
                    <img src={card.image} alt={card.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-left">
                       <span className="text-[10px] font-black text-primary uppercase">{card.grade}</span>
                       <span className="text-xs font-bold text-white truncate">{card.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {results && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl p-6"
          >
             {results.length > 1 && (
               <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-2">
                  {results.map((_, i) => (
                    <div
                      key={i}
                      className={`w-10 h-1 rounded-full transition-all duration-500 ${i <= revealedIndex ? 'bg-primary' : 'bg-white/10'}`}
                    />
                  ))}
               </div>
             )}

             <button
               onClick={closeResults}
               className="absolute top-8 right-8 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
             >
                <X className="w-6 h-6" />
             </button>

             <div className="relative w-full max-w-md aspect-[3/4] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {currentRevealed && (
                    <motion.div
                      key={currentRevealed.card.instanceId}
                      initial={{ rotateY: 180, scale: 0.8, opacity: 0 }}
                      animate={{ rotateY: 0, scale: 1, opacity: 1 }}
                      exit={{ rotateY: -180, scale: 0.8, opacity: 0 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                      className="w-full h-full flex flex-col items-center gap-8"
                    >
                       <KpopCardComponent
                         card={currentRevealed.card}
                         size="xl"
                         isNew={currentRevealed.isNewCard}
                       />

                       <div className="text-center">
                          <motion.h2
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-4xl font-black italic tracking-tighter text-white uppercase"
                          >
                             {currentRevealed.isNewCard ? 'NEW UNLOCKED!' : 'OBTAINED!'}
                          </motion.h2>
                          {currentRevealed.isDuplicate && (
                             <p className="text-accent text-sm font-bold uppercase tracking-widest mt-2 flex items-center justify-center gap-2">
                                <Coins className="w-4 h-4" />
                                Converted: +{DUPLICATE_REWARDS[currentRevealed.card.grade as Grade || 'R']} Coins
                             </p>
                          )}
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {currentRevealed && (currentRevealed.card.grade === 'UR' || currentRevealed.card.grade === 'SSR') && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.4 }}
                    className={`absolute inset-[-100%] z-[-1] blur-[100px] ${currentRevealed.card.grade === 'UR' ? 'bg-yellow-400/30' : 'bg-purple-400/30'}`}
                  />
                )}
             </div>

             {revealedIndex === results.length - 1 && (
               <motion.button
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 onClick={closeResults}
                 className="mt-12 px-16 py-5 bg-gradient-to-br from-primary to-accent rounded-full font-black text-2xl text-white shadow-2xl hover:scale-105 transition-transform"
               >
                 CONFIRM
               </motion.button>
             )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, current, max, color, approach }: { label: string; current: number; max: number; color: string; approach?: number }) {
  const percentage = Math.min((current / max) * 100, 100);
  const isApproaching = approach && current >= approach;

  return (
    <div className="bg-white/5 border border-white/5 rounded-3xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-3">
         <div className="flex flex-col">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{label}</span>
            <span className="text-lg font-black text-white tabular-nums">{current} <span className="text-white/20 text-xs">/ {max}</span></span>
         </div>
         {isApproaching && (
            <div className="flex items-center gap-1 bg-accent/20 px-2 py-0.5 rounded-full animate-pulse">
               <Info className="w-3 h-3 text-accent" />
               <span className="text-[8px] font-black text-accent uppercase tracking-tighter">Soft Pity</span>
            </div>
         )}
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
         <motion.div
           initial={{ width: 0 }}
           animate={{ width: `${percentage}%` }}
           className="h-full rounded-full"
           style={{ backgroundColor: color }}
         />
      </div>
    </div>
  );
}
