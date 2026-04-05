'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  Upload,
  TrendingUp,
  Trophy,
  Coins,
  Heart,
  Calendar,
  Activity,
  Zap,
  RefreshCcw
} from 'lucide-react';
import { CollectionState, Grade } from '../lib/types';
import { formatNumber } from '../lib/cardUtils';

interface StatsPanelProps {
  state: CollectionState;
  totalUniqueCards: number;
  totalCardsInGame: number;
  onExport: () => void;
  onImport: () => void;
  onConvertDuplicates?: () => void;
}

export function StatsPanel({
  state,
  totalUniqueCards,
  totalCardsInGame,
  onExport,
  onImport,
  onConvertDuplicates
}: StatsPanelProps) {

  const completionRate = (totalUniqueCards / totalCardsInGame) * 100 || 0;

  const gradeCount = (grade: Grade) =>
    new Set(state.ownedCards.filter(c => c.grade === grade).map(c => c.id)).size;

  const duplicateCount = state.ownedCards.length - totalUniqueCards;

  const stats = [
    { label: 'Total Pulls', value: formatNumber(state.totalPulls), icon: Zap, color: 'text-primary' },
    { label: 'Daily Streak', value: `${state.dailyStreak} Days`, icon: Calendar, color: 'text-accent' },
    { label: 'Currency', value: formatNumber(state.currency), icon: Coins, color: 'text-emerald-400' },
    { label: 'Unique Cards', value: `${totalUniqueCards} / ${totalCardsInGame}`, icon: Trophy, color: 'text-blue-400' },
  ];

  const gradeBreakdown = [
    { label: 'UR', value: gradeCount('UR'), color: 'bg-yellow-400' },
    { label: 'SSR', value: gradeCount('SSR'), color: 'bg-purple-400' },
    { label: 'SR', value: gradeCount('SR'), color: 'bg-blue-400' },
    { label: 'R', value: gradeCount('R'), color: 'bg-emerald-400' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Completion Ring */}
      <div className="bg-white/5 border border-white/5 rounded-[40px] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group shadow-2xl">
         <div className="relative w-40 h-40 flex items-center justify-center mb-6">
            <svg className="w-full h-full transform -rotate-90">
               <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
               <motion.circle
                 cx="80" cy="80" r="70"
                 stroke="currentColor" strokeWidth="8" fill="transparent"
                 strokeDasharray="440"
                 initial={{ strokeDashoffset: 440 }}
                 animate={{ strokeDashoffset: 440 - (440 * completionRate) / 100 }}
                 transition={{ duration: 2, ease: "easeOut" }}
                 className="text-primary drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]"
               />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-4xl font-black italic tracking-tighter text-white">{Math.round(completionRate)}%</span>
               <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Complete</span>
            </div>
         </div>
         <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-1">Collection Progress</h3>
         <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Keep pulling to reach 100%!</p>

         <div className="absolute top-0 right-0 p-8 opacity-5">
            <TrendingUp className="w-32 h-32" />
         </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
         {stats.map((stat, i) => (
           <div key={i} className="bg-white/5 border border-white/5 rounded-3xl p-5 hover:bg-white/10 transition-colors">
              <div className={`w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center mb-3 ${stat.color}`}>
                 <stat.icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-1">{stat.label}</span>
              <span className="text-sm font-black text-white">{stat.value}</span>
           </div>
         ))}
      </div>

      {/* Duplicate Conversion */}
      {duplicateCount > 0 && onConvertDuplicates && (
        <button
          onClick={onConvertDuplicates}
          className="group relative bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20 rounded-[32px] p-6 flex items-center justify-between hover:from-accent/20 hover:to-primary/20 transition-all text-left"
        >
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-accent uppercase tracking-widest mb-1 flex items-center gap-2">
              <RefreshCcw className="w-3 h-3 animate-spin-slow" />
              Duplicates Found
            </span>
            <span className="text-xl font-black text-white italic tracking-tighter">
              {duplicateCount} <span className="text-white/20 text-xs">Unconverted</span>
            </span>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Convert to credits now</p>
          </div>
          <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
             <Coins className="w-6 h-6" />
          </div>
        </button>
      )}

      {/* Grade Breakdown */}
      <div className="bg-white/5 border border-white/5 rounded-[32px] p-6">
         <h3 className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-6">Rarity Breakdown</h3>
         <div className="space-y-4">
            {gradeBreakdown.map((gb, i) => (
              <div key={i} className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${gb.color}`} />
                    <span className="text-xs font-black text-white uppercase tracking-widest">{gb.label}</span>
                 </div>
                 <span className="text-xs font-black text-white/40 tabular-nums">{gb.value}</span>
              </div>
            ))}
         </div>
      </div>

      {/* Data Tools */}
      <div className="grid grid-cols-2 gap-3 mt-2">
         <button
           onClick={onExport}
           className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
         >
            <Download className="w-3 h-3" />
            Export
         </button>
         <button
           onClick={onImport}
           className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
         >
            <Upload className="w-3 h-3" />
            Import
         </button>
      </div>
    </div>
  );
}
