'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Coins, X } from 'lucide-react';
import { useGacha } from '../hooks/useGacha';
import { Card } from './Card';
import { useGame } from '../context/GameContext';

export function GachaMachine() {
  const { userStats } = useGame();
  const { pull, isPulling, pulledCard, setPulledCard, PULL_COST } = useGacha();

  const handlePull = async () => {
    if (isPulling) return;
    await pull();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-4 relative overflow-hidden">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-black mb-4 kpop-gradient bg-clip-text text-transparent">
          KPOP CARDS
        </h1>
        <p className="text-lg text-white/60 max-w-md mx-auto">
          Collect your favorite idols. Try your luck to get the Ultra Rare cards!
        </p>
      </div>

      <div className="relative group w-full max-w-xs aspect-square flex items-center justify-center">
        <motion.div
          animate={isPulling ? {
            rotate: [0, -5, 5, -5, 5, 0],
            scale: [1, 1.1, 1, 1.1, 1],
          } : {}}
          transition={{ duration: 0.5, repeat: isPulling ? Infinity : 0 }}
          className="w-full h-full rounded-full border-8 border-primary/30 flex items-center justify-center relative bg-card-bg/50 backdrop-blur-sm group-hover:border-primary/50 transition-colors"
        >
          {isPulling ? (
            <Sparkles className="w-24 h-24 text-primary animate-pulse" />
          ) : (
            <div className="text-6xl text-primary font-bold">?</div>
          )}
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute -top-4 -right-4 w-12 h-12 bg-accent rounded-full animate-bounce" />
        <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-secondary rounded-full animate-pulse" />
      </div>

      <button
        onClick={handlePull}
        disabled={isPulling || userStats.credits < PULL_COST}
        className={`mt-12 px-8 py-4 rounded-full font-bold text-xl flex items-center gap-3 transition-all transform active:scale-95 shadow-xl ${
          isPulling || userStats.credits < PULL_COST
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
            : 'kpop-gradient text-white hover:scale-105 hover:shadow-primary/50'
        }`}
      >
        <Coins className="w-6 h-6" />
        {isPulling ? 'PULLING...' : `PULL (100)`}
      </button>

      <AnimatePresence>
        {pulledCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 100 }}
              className="relative w-full max-w-sm"
            >
              <button
                onClick={() => setPulledCard(null)}
                className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white bg-white/10 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mb-6 text-center">
                <motion.h2
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-3xl font-black text-white"
                >
                  NEW CARD OBTAINED!
                </motion.h2>
              </div>

              <div className="w-full aspect-[2/3] relative">
                <Card card={pulledCard} />
              </div>

              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                onClick={() => setPulledCard(null)}
                className="w-full mt-8 py-4 kpop-gradient rounded-xl font-bold text-lg text-white"
              >
                ADD TO COLLECTION
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
