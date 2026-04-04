'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Coins, X, Info } from 'lucide-react';
import { useGacha } from '../hooks/useGacha';
import { Card } from './Card';
import { useGame } from '../context/GameContext';
import { useState } from 'react';
import { HARD_PITY, PULL_COSTS } from '../lib/types';

export function GachaMachine() {
  const { state, claimDailyBonus } = useGame();
  const { pullSingle, pullTen, isPulling, lastResults, setLastResults, getPullRates } = useGacha();
  const [showRates, setShowRates] = useState(false);

  const bannerId = state.currentBannerId;
  const bannerType = 'standard'; // Hardcoded for now

  const rates = getPullRates(bannerType, state.urPityCounter, state.ssrPityCounter);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 px-4 relative overflow-hidden">
      {/* Daily Login Button */}
      <div className="absolute top-4 left-4 z-20">
         <button
           onClick={() => {
             const res = claimDailyBonus();
             alert(res.message);
           }}
           className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-full backdrop-blur-sm border border-white/5 transition-all"
         >
           {state.lastDailyBonus ? "STREAK: " + state.dailyStreak : "CLAIM DAILY BONUS"}
         </button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-black mb-4 kpop-gradient bg-clip-text text-transparent italic tracking-tighter">
          KPOP GACHA
        </h1>
        <div className="flex flex-col items-center gap-2">
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            PITY: UR {state.urPityCounter}/{HARD_PITY.UR} • SSR {state.ssrPityCounter}/{HARD_PITY.SSR}
            <button onClick={() => setShowRates(!showRates)} className="text-accent hover:text-white transition-colors">
              <Info className="w-4 h-4" />
            </button>
          </p>

          <AnimatePresence>
            {showRates && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-black/40 p-3 rounded-xl border border-white/5 backdrop-blur-md text-[10px] text-white/60 font-mono grid grid-cols-2 gap-x-4 gap-y-1"
              >
                <span>UR RATE: {rates.UR.toFixed(2)}%</span>
                <span>SSR RATE: {rates.SSR.toFixed(2)}%</span>
                <span>SR RATE: {rates.SR.toFixed(2)}%</span>
                <span>R RATE: {rates.R.toFixed(2)}%</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="relative group w-full max-w-xs aspect-square flex items-center justify-center">
        <motion.div
          animate={isPulling ? {
            rotate: [0, -10, 10, -10, 10, 0],
            scale: [1, 1.15, 1, 1.15, 1],
          } : {}}
          transition={{ duration: 0.4, repeat: isPulling ? Infinity : 0 }}
          className="w-full h-full rounded-full border-8 border-primary/20 flex items-center justify-center relative bg-card-bg/30 backdrop-blur-sm group-hover:border-primary/40 transition-all shadow-[0_0_50px_rgba(236,72,153,0.1)]"
        >
          {isPulling ? (
            <Sparkles className="w-32 h-32 text-primary animate-pulse" />
          ) : (
            <div className="text-8xl text-white font-black drop-shadow-2xl opacity-20">?</div>
          )}
        </motion.div>

        <div className="absolute top-0 right-0 w-16 h-16 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-12 w-full max-w-md">
        <button
          onClick={() => pullSingle(bannerId, bannerType)}
          disabled={isPulling || state.currency < PULL_COSTS.SINGLE}
          className={`flex-1 px-8 py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl ${
            isPulling || state.currency < PULL_COSTS.SINGLE
              ? 'bg-white/5 text-white/20 cursor-not-allowed'
              : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
          }`}
        >
          <Coins className="w-6 h-6" />
          {PULL_COSTS.SINGLE}
        </button>

        <button
          onClick={() => pullTen(bannerId, bannerType)}
          disabled={isPulling || state.currency < PULL_COSTS.TEN}
          className={`flex-[2] px-8 py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-2xl ${
            isPulling || state.currency < PULL_COSTS.TEN
              ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
              : 'kpop-gradient text-white hover:scale-[1.02] hover:shadow-primary/50'
          }`}
        >
          <Sparkles className="w-6 h-6" />
          TEN PULL ({PULL_COSTS.TEN})
        </button>
      </div>

      <AnimatePresence>
        {lastResults && lastResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/98 backdrop-blur-2xl p-4 overflow-y-auto"
          >
            <div className="max-w-6xl w-full py-12">
              <div className="text-center mb-12">
                <h2 className="text-5xl font-black text-white italic tracking-tighter mb-2">
                  RESULTS
                </h2>
                <div className="h-1 w-24 bg-primary mx-auto rounded-full" />
              </div>

              <div className={`grid gap-6 ${lastResults.length === 1 ? 'max-w-sm mx-auto' : 'grid-cols-2 md:grid-cols-5'}`}>
                {lastResults.map((res, i) => (
                  <motion.div
                    key={res.card.instanceId}
                    initial={{ scale: 0.5, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, type: 'spring', damping: 15 }}
                    className="relative"
                  >
                    <Card card={res.card} />
                    {res.isDuplicate && (
                      <div className="absolute -top-2 -right-2 bg-accent text-black text-[10px] font-black px-2 py-1 rounded-lg shadow-lg z-30">
                        +{res.coinReward} COINS
                      </div>
                    )}
                    {res.pityTriggered && (
                        <div className="absolute -bottom-2 inset-x-0 text-center z-30">
                           <span className="bg-white text-black text-[8px] font-black px-2 py-0.5 rounded-full">PITY</span>
                        </div>
                    )}
                  </motion.div>
                ))}
              </div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: lastResults.length * 0.1 + 0.5 }}
                onClick={() => setLastResults(null)}
                className="block mx-auto mt-16 px-16 py-5 kpop-gradient rounded-full font-black text-2xl text-white shadow-2xl hover:scale-105 transition-transform"
              >
                CONFIRM
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
