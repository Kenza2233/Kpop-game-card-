'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, Coins, Layers } from 'lucide-react';
import { OwnedCard, Grade } from '../lib/types';
import { KpopCardComponent } from './KpopCard';

interface CardModalProps {
  card: OwnedCard;
  onClose: () => void;
  ownedCopies: number;
  isDuplicate?: boolean;
}

export function CardModal({ card, onClose, ownedCopies, isDuplicate }: CardModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-8 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-4xl bg-card-bg/40 border border-white/10 rounded-[40px] overflow-hidden grid grid-cols-1 md:grid-cols-2 shadow-[0_0_100px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-50 p-3 rounded-full bg-black/40 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Left: Card Display */}
        <div className="p-8 md:p-12 flex items-center justify-center bg-white/5">
           <KpopCardComponent card={card} size="xl" />
        </div>

        {/* Right: Info */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
           <div className="mb-8">
              <span className="bg-primary/20 text-primary px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20 mb-4 inline-block">
                 {card.category}
              </span>
              <h2 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none mb-2">
                 {card.name}
              </h2>
              <p className="text-xl font-bold text-white/40 uppercase tracking-widest italic">
                 {card.group}
              </p>
           </div>

           <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-1">Era</span>
                    <span className="text-sm font-bold text-white">{card.era}</span>
                 </div>
                 <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-1">Year</span>
                    <span className="text-sm font-bold text-white">{card.year}</span>
                 </div>
              </div>

              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                       <Layers className="w-5 h-5" />
                    </div>
                    <div>
                       <span className="text-xs font-black text-white uppercase tracking-tighter block">Owned Copies</span>
                       <span className="text-2xl font-black text-white tabular-nums">{ownedCopies}</span>
                    </div>
                 </div>
                 {isDuplicate && (
                   <button className="bg-accent/10 border border-accent/20 px-4 py-2 rounded-xl text-accent text-[10px] font-black uppercase tracking-widest hover:bg-accent/20 transition-all flex items-center gap-2">
                      <Coins className="w-3 h-3" />
                      Convert
                   </button>
                 )}
              </div>

              <div className="p-6 bg-gradient-to-br from-white/10 to-transparent rounded-3xl border border-white/5">
                 <p className="text-xs text-white/60 font-medium leading-relaxed italic">
                    &quot;Collect all cards from {card.group} to unlock exclusive group rewards!&quot;
                 </p>
              </div>
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
