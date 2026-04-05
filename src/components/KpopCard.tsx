'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { KpopCard, Grade } from '../lib/types';
import { getGradeConfig } from '../lib/cardUtils';
import { cn } from '../lib/utils';

interface KpopCardProps {
  card: KpopCard;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: (card: KpopCard) => void;
  showGrade?: boolean;
  isHolographic?: boolean;
  isNew?: boolean;
}

const SIZES = {
  sm: 'w-24 md:w-28 h-32 md:h-36',
  md: 'w-40 md:w-48 h-56 md:h-64',
  lg: 'w-56 md:w-64 h-80 md:h-96',
  xl: 'w-72 md:w-80 h-[480px] md:h-[560px]',
};

const IMAGE_SIZES = {
  sm: 'w-full h-32',
  md: 'w-full h-48',
  lg: 'w-full h-64',
  xl: 'w-full h-80',
};

const IdolImage = ({ card, size }: { card: KpopCard; size: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const cacheKey = `img_${card.id}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      setImageUrl(cached);
      setLoading(false);
      return;
    }

    const fetchImage = async () => {
      try {
        const res = await fetch(`/api/get-image?group=${encodeURIComponent(card.group)}&idol=${encodeURIComponent(card.name)}`);
        const data = await res.json();

        if (data.imageUrl) {
          setImageUrl(data.imageUrl);
          localStorage.setItem(cacheKey, data.imageUrl);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [card.id, card.group, card.name]);

  const gradeConfig = getGradeConfig(card.grade as Grade || 'R');

  if (error || !imageUrl) {
    const initials = card.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return (
      <div
        className={cn(
          "flex items-center justify-center font-display font-bold text-white relative overflow-hidden",
          IMAGE_SIZES[size],
          card.grade === 'UR' && "animate-pulse-glow"
        )}
        style={{
          background: gradeConfig.gradient,
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}
      >
        {/* Pattern Overlay for UR */}
        {card.grade === 'UR' && gradeConfig.pattern && (
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: gradeConfig.pattern }} />
        )}

        {/* Holographic Angle for SSR */}
        {card.grade === 'SSR' && (
            <div className="absolute inset-0 animate-holo-shift opacity-30 pointer-events-none bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        )}

        <div className="text-center z-10">
          <div className="text-3xl font-black italic tracking-tighter">{initials}</div>
          <div className="text-[10px] mt-1 opacity-80 uppercase font-black">{card.name}</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cn("animate-pulse bg-slate-800", IMAGE_SIZES[size])}>
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={`${card.name} - ${card.group}`}
      className={cn("object-cover", IMAGE_SIZES[size])}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
};

export const KpopCardComponent = React.memo(({
  card,
  size = 'md',
  onClick,
  showGrade = true,
  isNew = false
}: KpopCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const gradeConfig = useMemo(() => getGradeConfig(card.grade as Grade || 'R'), [card.grade]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || card.grade !== 'SSR') return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onClick={() => onClick?.(card)}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      layout
      className={cn(
        "relative rounded-2xl overflow-hidden group cursor-pointer transition-all",
        SIZES[size]
      )}
      style={{
        boxShadow: `0 0 25px ${gradeConfig.glowColor}`,
        border: `2px solid ${gradeConfig.borderColor}`,
      }}
    >
      {/* Background & Image */}
      <div className="absolute inset-0 bg-slate-900">
        <IdolImage card={card} size={size} />
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />

      {/* Grade Shimmer/Holo Effects */}
      {gradeConfig.shimmer && (
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
        </div>
      )}

      {card.grade === 'SSR' && (
        <div
          className="absolute inset-0 z-20 pointer-events-none mix-blend-color-dodge opacity-0 group-hover:opacity-40 transition-opacity"
          style={{
            background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(192, 132, 252, 0.8), transparent 50%)`,
          }}
        />
      )}

      {card.grade === 'UR' && (
        <div className="absolute inset-0 z-20 pointer-events-none">
           {[...Array(gradeConfig.sparkleParticles)].map((_, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, scale: 0 }}
               animate={{
                 opacity: [0, 1, 0],
                 scale: [0, 1.5, 0],
                 x: [0, (Math.random() - 0.5) * 100],
                 y: [0, (Math.random() - 0.5) * 150]
               }}
               transition={{
                 duration: 2 + Math.random(),
                 repeat: Infinity,
                 delay: Math.random() * 2
               }}
               className="absolute top-1/2 left-1/2 w-1 h-1 bg-yellow-400 rounded-full blur-[1px]"
             />
           ))}
        </div>
      )}

      {/* UI Elements */}
      <div className="absolute top-2 left-2 z-30 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
         <span className="text-[10px] font-black text-white/80 uppercase tracking-tighter">
            {card.category}
         </span>
      </div>

      {showGrade && (
        <div className="absolute top-2 right-2 z-30 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 shadow-xl">
           <span className="text-xs font-black italic tracking-tighter" style={{ color: gradeConfig.textColor }}>
              {card.grade}
           </span>
        </div>
      )}

      {isNew && (
        <div className="absolute top-0 right-0 z-40 bg-accent text-black font-black text-[10px] px-3 py-1 rotate-45 translate-x-4 translate-y-[-2px] shadow-lg">
           NEW
        </div>
      )}

      <div className="absolute bottom-3 left-4 right-4 z-30">
         <h3 className="text-sm md:text-lg font-black text-white italic tracking-tighter leading-none mb-1 drop-shadow-md truncate">
           {card.name}
         </h3>
         <p className="text-[10px] md:text-xs font-bold text-white/60 uppercase tracking-widest leading-none drop-shadow-md">
           {card.group}
         </p>
      </div>

      {card.grade === 'UR' && (
        <div className="absolute inset-0 z-5 border-4 border-yellow-400/20 animate-pulse pointer-events-none" />
      )}
    </motion.div>
  );
});

KpopCardComponent.displayName = 'KpopCardComponent';
