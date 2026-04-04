'use client';

import { motion } from 'framer-motion';
import { useCollection } from '../context/CollectionContext';
import { Card } from './Card';
import { useState } from 'react';
import { GradeFilter } from '../lib/types';
import { Trash2, Download, Upload } from 'lucide-react';

export function CollectionGrid() {
  const { state, convertDuplicates, exportCollection, importCollection } = useCollection();
  const [filter, setFilter] = useState<GradeFilter>('all');

  const filteredCollection = filter === 'all'
    ? state.ownedCards
    : state.ownedCards.filter(c => c.grade === filter);

  const grades: GradeFilter[] = ['all', 'R', 'SR', 'SSR', 'UR'];

  return (
    <div className="py-12 px-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">
          COLLECTION ({state.ownedCards.length})
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              const res = convertDuplicates();
              alert(`Removed ${res.cardsRemoved} duplicates and gained ${res.coinsGained} coins!`);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-all uppercase"
            title="Convert Duplicates"
          >
            <Trash2 className="w-3 h-3" />
            Convert
          </button>

          <button
            onClick={() => {
               const data = exportCollection();
               const blob = new Blob([data], { type: 'application/json' });
               const url = URL.createObjectURL(blob);
               const a = document.createElement('a');
               a.href = url;
               a.download = `kpop_collection_${new Date().toISOString().split('T')[0]}.json`;
               a.click();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all uppercase"
          >
            <Download className="w-3 h-3" />
            Export
          </button>

          {grades.map((g) => (
            <button
              key={g}
              onClick={() => setFilter(g)}
              className={`px-5 py-2 rounded-xl text-xs font-black tracking-widest transition-all border ${
                filter === g
                  ? 'bg-primary border-primary text-white shadow-xl shadow-primary/30 scale-105'
                  : 'bg-card-bg border-white/5 text-white/30 hover:bg-white/10'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {state.ownedCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-white/20 text-2xl mb-6 italic tracking-tighter font-black">
            NO CARDS COLLECTED YET.
          </p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8"
        >
          {filteredCollection.map((card) => (
            <motion.div
              layout
              key={card.instanceId}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Card card={card} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
