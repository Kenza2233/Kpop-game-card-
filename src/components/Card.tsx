'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { KpopCard, GRADE_COLORS } from '../lib/types';

interface CardProps {
  card: KpopCard;
  showGrade?: boolean;
}

export function Card({ card, showGrade = true }: CardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group w-full aspect-[2/3] rounded-xl overflow-hidden bg-card-bg border border-white/10 shadow-2xl card-shine cursor-pointer"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src={card.image}
          alt={card.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-60 group-hover:opacity-80 transition-opacity" />

      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
        <div className="flex flex-col gap-1">
          {showGrade && (
            <div className="flex justify-between items-center">
              <span className={`text-xs font-black uppercase tracking-widest ${GRADE_COLORS[card.grade!]}`}>
                {card.grade}
              </span>
              <span className="text-[10px] text-white/40 uppercase tracking-tighter">
                {card.category}
              </span>
            </div>
          )}
          <h3 className="text-xl font-bold text-white truncate leading-none">{card.name}</h3>
          <p className="text-sm text-white/70 font-medium">{card.group.toLowerCase()}</p>
          <div className="flex justify-between items-center mt-1">
             <p className="text-[10px] text-white/40 uppercase tracking-widest">
               {card.era} • {card.year}
             </p>
             {card.isNew && (
               <span className="text-[9px] bg-accent text-black px-1 rounded font-bold uppercase">New</span>
             )}
          </div>
        </div>
      </div>

      {card.grade === 'UR' && (
        <div className="absolute inset-0 ring-4 ring-yellow-400/50 ring-inset pointer-events-none animate-pulse" />
      )}
    </motion.div>
  );
}
