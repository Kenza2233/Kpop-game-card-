'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KpopCard } from '../lib/types';
import { KpopCardComponent } from './KpopCard';
import { Grid, List, Search, Loader2 } from 'lucide-react';

interface CardGridProps {
  cards: KpopCard[];
  loading?: boolean;
  onCardClick?: (card: KpopCard) => void;
  pageSize?: number;
  viewMode?: 'grid' | 'list';
}

export function CardGrid({
  cards,
  loading = false,
  onCardClick,
  pageSize = 20,
  viewMode = 'grid'
}: CardGridProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedCards = useMemo(() => {
    return cards.slice(0, currentPage * pageSize);
  }, [cards, currentPage, pageSize]);

  const hasMore = paginatedCards.length < cards.length;

  if (loading) {
    return (
      <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6 py-12 px-6 max-w-7xl mx-auto">
        {[...Array(pageSize)].map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] rounded-2xl bg-white/5 border border-white/10 animate-pulse flex items-center justify-center"
          >
             <Loader2 className="w-6 h-6 text-white/10 animate-spin" />
          </div>
        ))}
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-6">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
           <Search className="w-8 h-8 text-white/10" />
        </div>
        <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase mb-2">
           No cards found
        </h3>
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest max-w-xs">
           Adjust your filters or keep pulling from banners to grow your collection!
        </p>
      </div>
    );
  }

  return (
    <div className="py-12 px-6 max-w-7xl mx-auto flex flex-col gap-12">

      <motion.div
        layout
        className={`w-full ${
          viewMode === 'grid'
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 md:gap-8'
            : 'flex flex-col gap-4'
        }`}
      >
        <AnimatePresence mode="popLayout">
          {paginatedCards.map((card, i) => (
            <motion.div
              key={card.id + (card as any).instanceId || i}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4, delay: (i % pageSize) * 0.05 }}
              layout
            >
              <KpopCardComponent
                card={card}
                size={viewMode === 'grid' ? 'md' : 'sm'}
                onClick={onCardClick}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {hasMore && (
        <button
          onClick={() => setCurrentPage(prev => prev + 1)}
          className="mx-auto px-12 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black uppercase tracking-widest text-white/60 hover:text-white transition-all shadow-xl active:scale-95"
        >
          Load More Cards
        </button>
      )}
    </div>
  );
}
