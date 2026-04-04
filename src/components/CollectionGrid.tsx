'use client';

import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Card } from './Card';
import { useState } from 'react';
import { Rarity } from '../lib/types';

export function CollectionGrid() {
  const { userStats } = useGame();
  const [filter, setFilter] = useState<Rarity | 'All'>('All');

  const filteredCollection = filter === 'All'
    ? userStats.collection
    : userStats.collection.filter(c => c.rarity === filter);

  const rarities: (Rarity | 'All')[] = ['All', 'Common', 'Rare', 'Super Rare', 'Ultra Rare'];

  return (
    <div className="py-12 px-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <h2 className="text-3xl font-black text-white">MY COLLECTION ({userStats.collection.length})</h2>

        <div className="flex flex-wrap items-center gap-2">
          {rarities.map((r) => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                filter === r
                  ? 'bg-primary border-primary text-white'
                  : 'bg-card-bg border-white/10 text-white/50 hover:bg-white/5'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {userStats.collection.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-white/40 text-xl mb-6 italic">Your collection is empty. Go and pull some cards!</p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {filteredCollection.map((card) => (
            <motion.div
              layout
              key={card.instanceId}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card card={card} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
