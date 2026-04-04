'use client';

import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Card } from './Card';
import { useState } from 'react';
import { Grade } from '../lib/types';

export function CollectionGrid() {
  const { userStats } = useGame();
  const [filter, setFilter] = useState<Grade | 'All'>('All');

  const filteredCollection = filter === 'All'
    ? userStats.collection
    : userStats.collection.filter(c => c.grade === filter);

  const grades: (Grade | 'All')[] = ['All', 'R', 'SR', 'SSR', 'UR'];

  return (
    <div className="py-12 px-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <h2 className="text-3xl font-black text-white uppercase tracking-tight">
          MY COLLECTION ({userStats.collection.length})
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          {grades.map((g) => (
            <button
              key={g}
              onClick={() => setFilter(g)}
              className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest transition-all border ${
                filter === g
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-card-bg border-white/10 text-white/40 hover:bg-white/5'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {userStats.collection.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-white/30 text-xl mb-6 italic tracking-tight font-medium">
            Your collection is empty. Go and pull some cards!
          </p>
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
