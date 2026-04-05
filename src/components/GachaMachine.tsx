'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Coins, Info, Clock, ChevronDown, ChevronUp, History, X } from 'lucide-react';
import { Banner, GachaPullResult, HARD_PITY, SOFT_PITY, PULL_COSTS, SPARK_COST, DUPLICATE_REWARDS, Grade } from '../lib/types';
import { getGradeConfig } from '../lib/cardUtils';
import { KpopCardComponent } from './KpopCard';
import { useCardCollection } from '@/hooks/useCardCollection';
import { useCollection } from '@/context/CollectionContext';
import { ImageWithFallback } from './ImageWithFallback';

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
  pullHistory,
}: GachaMachineProps) {
  const [pullState, setPullState] = useState<'idle' | 'pulling' | 'revealing' | 'multiRevealing'>('idle');
  const [results, setResults] = useState<GachaPullResult[] | null>(null);
  const [revealedIndex, setRevealedIndex] = useState(-1);
  const [showMobileStats, setShowMobileStats] = useState(false);
  const [showSparkShop, setShowSparkShop] = useState(false);
  const { cards: allCards } = useCardCollection();
  const { sparkCard } = useCollection();

  const handlePull = async (count: number) => {
    if (pullState !== 'idle') return;

    setPullState('pulling');
    setResults(null);
    setRevealedIndex(-1);

    // Initial machine shake/wait
    await new Promise(r => setTimeout(r, 1500));

    const newResults = onPull(count);
    if (newResults.length === 0) {
      setPullState('idle');
      return;
    }

    setResults(newResults);

    if (count === 1) {
      setPullState('revealing');
      setRevealedIndex(0);
    } else {
      setPullState('multiRevealing');
      // Stagger reveal of icons in the grid
      for (let i = 0; i < newResults.length; i++) {
        setRevealedIndex(i);
        await new Promise(r => setTimeout(r, 200));
      }
    }
  };

  const handleFreePull = async () => {
    if (pullState !== 'idle' || !canFreePull) return;

    setPullState('pulling');
    setResults(null);
    setRevealedIndex(-1);

    await new Promise(r => setTimeout(r, 1500));

    const res = onFreePull();
    if (!res) {
      setPullState('idle');
      return;
    }

    setResults([res]);
    setPullState('revealing');
    setRevealedIndex(0);
  };

  const closeResults = () => {
    setPullState('idle');
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
                      {card && <ImageWithFallback group={card.group} idol={card.name} alt={card.name} className="w-full h-full object-cover" />}
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
               animate={pullState === 'pulling' ? {
                 rotate: [0, -5, 5, -5, 5, 0],
                 scale: [1, 1.05, 1, 1.05, 1],
               } : {}}
               transition={{ duration: 0.3, repeat: Infinity, repeatType: 'reverse' }}
               className="relative z-10 w-full h-full border-8 border-white/5 rounded-3xl bg-card-bg/40 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
            >
               <Sparkles className={`w-24 h-24 transition-colors duration-1000 ${pullState === 'pulling' ? 'text-primary' : 'text-white/10'}`} />
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
                 disabled={pullState !== 'idle' || currency < PULL_COSTS.SINGLE}
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
                 disabled={pullState !== 'idle' || currency < PULL_COSTS.TEN}
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
               disabled={!canFreePull || pullState !== 'idle'}
               className={`w-full border-2 rounded-2xl py-3 text-xs font-black uppercase tracking-widest transition-all ${
                 canFreePull && pullState === 'idle'
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

            {/* Recent Pulls Section */}
            <div className="bg-white/5 border border-white/5 rounded-3xl p-5 shadow-xl">
               <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Recent Pulls</span>
                  <History className="w-3 h-3 text-white/20" />
               </div>
               <div className="flex gap-2 justify-between">
                  {pullHistory.slice(0, 5).map((entry, i) => (
                    <motion.div
                      key={`${entry.card.instanceId}-${i}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className={`relative w-10 h-10 rounded-full border-2 p-0.5 ${
                        entry.card.grade === 'UR' ? 'border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)]' :
                        entry.card.grade === 'SSR' ? 'border-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.3)]' :
                        entry.card.grade === 'SR' ? 'border-blue-400' : 'border-white/10'
                      }`}
                    >
                       <div className="w-full h-full rounded-full overflow-hidden bg-slate-800">
                          <ImageWithFallback
                            group={entry.card.group}
                            idol={entry.card.name}
                            alt={entry.card.name}
                            className="w-full h-full object-cover"
                          />
                       </div>
                       <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-black flex items-center justify-center text-[6px] font-black text-white shadow-sm ${
                          entry.card.grade === 'UR' ? 'bg-yellow-400' :
                          entry.card.grade === 'SSR' ? 'bg-purple-400' :
                          entry.card.grade === 'SR' ? 'bg-blue-400' : 'bg-slate-500'
                       }`}>
                          {entry.card.grade}
                       </div>
                    </motion.div>
                  ))}
                  {pullHistory.length === 0 && (
                    <div className="w-full py-2 text-center text-[10px] font-bold text-white/10 uppercase tracking-widest">
                       No pulls yet
                    </div>
                  )}
               </div>
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
                    <ImageWithFallback group={card.group} idol={card.name} alt={card.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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

        {/* REVEAL OVERLAYS */}
        {pullState === 'revealing' && results && results[0] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/95 backdrop-blur-3xl p-6 overflow-hidden"
          >
             <motion.div
               key="single-reveal"
               initial={{ rotateY: 180, scale: 0.5, opacity: 0 }}
               animate={{ rotateY: 0, scale: 1, opacity: 1 }}
               transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
               className="relative flex flex-col items-center gap-10"
             >
                <div className="relative group">
                    <KpopCardComponent
                      card={results[0].card}
                      size="xl"
                      isNew={results[0].isNewCard}
                    />

                    {/* Grade Banner */}
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.5 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.5, type: 'spring' }}
                      className="absolute -top-12 left-1/2 -translate-x-1/2 px-8 py-2 rounded-full border-4 border-black shadow-2xl transform -rotate-3 z-50"
                      style={{
                        background: getGradeConfig(results[0].card.grade as Grade).gradient,
                        color: 'white'
                      }}
                    >
                        <span className="text-3xl font-black italic tracking-tighter uppercase whitespace-nowrap">
                           {results[0].card.grade}{results[0].card.grade === 'UR' ? '!!!' : results[0].card.grade === 'SSR' ? '!!' : '!'}
                        </span>
                    </motion.div>
                </div>

                <div className="text-center space-y-2">
                   <motion.h2
                     initial={{ y: 20, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.7 }}
                     className="text-4xl md:text-5xl font-black italic tracking-tighter text-white uppercase"
                   >
                      {results[0].card.name}
                   </motion.h2>

                   <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ delay: 0.9 }}
                   >
                     {results[0].isNewCard ? (
                        <span className="inline-block px-6 py-2 bg-green-500 text-black font-black text-sm rounded-full animate-bounce shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                           NEW COLLECTION
                        </span>
                     ) : (
                        <div className="flex flex-col items-center gap-1">
                           <span className="px-4 py-1 bg-white/10 text-white/40 font-black text-xs rounded-full uppercase tracking-widest">
                              Duplicate Card
                           </span>
                           <span className="text-accent text-sm font-black flex items-center gap-1">
                              <Coins className="w-3 h-3" />
                              +{DUPLICATE_REWARDS[results[0].card.grade as Grade || 'R']} Coins Converted
                           </span>
                        </div>
                     )}
                   </motion.div>
                </div>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  onClick={closeResults}
                  className="mt-4 px-12 py-4 bg-white text-black rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl"
                >
                  CONTINUE
                </motion.button>
             </motion.div>

             {/* Rarity BG Effects */}
             {(results[0].card.grade === 'UR' || results[0].card.grade === 'SSR') && (
                <div className={`absolute inset-0 z-[-1] opacity-30 blur-[120px] animate-pulse ${results[0].card.grade === 'UR' ? 'bg-yellow-400' : 'bg-purple-600'}`} />
             )}
          </motion.div>
        )}

        {pullState === 'multiRevealing' && results && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/98 backdrop-blur-3xl p-6"
          >
             <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
                {results.map((res, i) => (
                   <motion.div
                     key={res.card.instanceId}
                     initial={{ scale: 0, rotateY: 180, opacity: 0 }}
                     animate={i <= revealedIndex ? { scale: 1, rotateY: 0, opacity: 1 } : {}}
                     transition={{ duration: 0.5, type: 'spring' }}
                     className="relative"
                   >
                      <KpopCardComponent
                        card={res.card}
                        size="md"
                        isNew={res.isNewCard}
                      />
                      {(res.card.grade === 'UR' || res.card.grade === 'SSR') && (
                         <div className={`absolute inset-0 rounded-2xl ring-4 ring-offset-4 ring-offset-black animate-pulse ${res.card.grade === 'UR' ? 'ring-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.5)]' : 'ring-purple-400 shadow-[0_0_30px_rgba(192,132,252,0.5)]'}`} />
                      )}
                   </motion.div>
                ))}
             </div>

             {revealedIndex === results.length - 1 && (
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex flex-col items-center gap-8"
               >
                  <div className="flex gap-4 items-center px-8 py-3 bg-white/5 rounded-full border border-white/10">
                      {['UR', 'SSR', 'SR', 'R'].map(g => {
                         const count = results.filter(r => r.card.grade === g).length;
                         if (count === 0) return null;
                         return (
                            <div key={g} className="flex items-center gap-1.5 px-3 border-r border-white/10 last:border-0">
                               <span className="w-2 h-2 rounded-full" style={{ background: getGradeConfig(g as Grade).borderColor }} />
                               <span className="text-xs font-black text-white/60">{count} {g}</span>
                            </div>
                         );
                      })}
                  </div>

                  <button
                    onClick={closeResults}
                    className="px-20 py-5 bg-gradient-to-r from-primary to-accent text-white rounded-full font-black text-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,45,120,0.3)]"
                  >
                    CONTINUE
                  </button>
               </motion.div>
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
