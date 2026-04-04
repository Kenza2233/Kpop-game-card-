'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Coins, X } from 'lucide-react';
import { useGacha } from '../hooks/useGacha';
import { Card } from './Card';
import { useGame } from '../context/GameContext';

export function GachaMachine() {
  const { state } = useGame();
  const { pull, isPulling, lastResult, setLastResult, PULL_COST } = useGacha();

  const handlePull = async () => {
    if (isPulling) return;
    await pull();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-4 relative overflow-hidden">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-black mb-4 kpop-gradient bg-clip-text text-transparent">
          KPOP GACHA
        </h1>
        <p className="text-lg text-white/60 max-w-md mx-auto">
          Try your luck for the Ultra Rare cards!
          <br/>
          <span className="text-xs uppercase tracking-widest text-accent font-bold">
            Pity: UR {state.urPityCounter}/50 • SSR {state.ssrPityCounter}/20
          </span>
        </p>
      </div>

      <div className="relative group w-full max-w-xs aspect-square flex items-center justify-center">
        <motion.div
          animate={isPulling ? {
            rotate: [0, -10, 10, -10, 10, 0],
            scale: [1, 1.15, 1, 1.15, 1],
          } : {}}
          transition={{ duration: 0.4, repeat: isPulling ? Infinity : 0 }}
          className="w-full h-full rounded-full border-8 border-primary/30 flex items-center justify-center relative bg-card-bg/50 backdrop-blur-sm group-hover:border-primary/50 transition-colors shadow-2xl"
        >
          {isPulling ? (
            <Sparkles className="w-32 h-32 text-primary animate-pulse" />
          ) : (
            <div className="text-7xl text-primary font-black drop-shadow-lg">?</div>
          )}
        </motion.div>

        <div className="absolute -top-4 -right-4 w-12 h-12 bg-accent rounded-full animate-bounce shadow-lg" />
        <div className="absolute -bottom-4 -left-4 w-10 h-10 bg-secondary rounded-full animate-pulse shadow-lg" />
      </div>

      <button
        onClick={handlePull}
        disabled={isPulling || state.currency < PULL_COST}
        className={`mt-12 px-10 py-5 rounded-full font-black text-2xl flex items-center gap-3 transition-all transform active:scale-95 shadow-2xl ${
          isPulling || state.currency < PULL_COST
            ? 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-50'
            : 'kpop-gradient text-white hover:scale-105 hover:shadow-primary/50'
        }`}
      >
        <Coins className="w-8 h-8" />
        {isPulling ? 'GACHA...' : `PULL (100)`}
      </button>

      <AnimatePresence>
        {lastResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
          >
            <motion.div
              initial={{ scale: 0.3, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 100 }}
              className="relative w-full max-w-sm"
            >
              <button
                onClick={() => setLastResult(null)}
                className="absolute -top-16 right-0 p-3 text-white/50 hover:text-white bg-white/5 rounded-full"
              >
                <X className="w-8 h-8" />
              </button>

              <div className="mb-6 text-center">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-4xl font-black text-white tracking-tighter italic">
                    {lastResult.isNewCard ? 'NEW UNLOCKED!' : 'OBTAINED!'}
                  </h2>
                  {lastResult.pityTriggered && (
                    <p className="text-accent text-sm font-bold uppercase tracking-widest mt-1">
                       ✨ Pity Triggered! ✨
                    </p>
                  )}
                </motion.div>
              </div>

              <div className="w-full aspect-[2/3] relative">
                <Card card={lastResult.card} />
              </div>

              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={() => setLastResult(null)}
                className="w-full mt-10 py-5 kpop-gradient rounded-2xl font-black text-xl text-white shadow-xl"
              >
                CONFIRM
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
