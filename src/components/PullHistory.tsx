'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { History, Clock, Coins, Star, Layers, Search } from 'lucide-react';
import { PullHistoryEntry, Grade } from '../lib/types';
import { formatNumber } from '../lib/cardUtils';

interface PullHistoryProps {
  history: PullHistoryEntry[];
  onCardClick?: (id: string) => void;
}

export function PullHistory({ history, onCardClick }: PullHistoryProps) {

  const stats = useMemo(() => {
    const last100 = history.slice(0, 100);
    return {
      ur: last100.filter(p => p.card.grade === 'UR').length,
      ssr: last100.filter(p => p.card.grade === 'SSR').length,
      sr: last100.filter(p => p.card.grade === 'SR').length,
      r: last100.filter(p => p.card.grade === 'R').length,
    };
  }, [history]);

  const getGradeStyle = (grade: Grade) => {
    switch (grade) {
      case 'UR': return 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5';
      case 'SSR': return 'text-purple-400 border-purple-400/20 bg-purple-400/5';
      case 'SR': return 'text-blue-400 border-blue-400/20 bg-blue-400/5';
      default: return 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5';
    }
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center bg-white/5 rounded-[40px] border border-white/5">
         <History className="w-12 h-12 text-white/10 mb-4" />
         <h3 className="text-xl font-black italic tracking-tighter text-white uppercase">No pull history yet</h3>
         <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-2">Start pulling from banners to see your history!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Summary Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
           { label: 'UR Rate', value: stats.ur, color: 'text-yellow-400' },
           { label: 'SSR Rate', value: stats.ssr, color: 'text-purple-400' },
           { label: 'SR Rate', value: stats.sr, color: 'text-blue-400' },
           { label: 'Total Logs', value: history.length, color: 'text-white/40' },
         ].map((s, i) => (
           <div key={i} className="bg-white/5 border border-white/5 rounded-3xl p-5">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-1">{s.label}</span>
              <span className={`text-xl font-black italic tracking-tighter ${s.color}`}>{s.value}</span>
           </div>
         ))}
      </div>

      {/* History List */}
      <div className="bg-white/5 border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
         <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <h3 className="text-xs font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
               <Clock className="w-3 h-3" />
               Recent Pull Logs
            </h3>
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Showing last {Math.min(history.length, 100)}</span>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01]">
                     <th className="px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-widest">#</th>
                     <th className="px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-widest">Card</th>
                     <th className="px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-widest text-center">Grade</th>
                     <th className="px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-widest">Banner</th>
                     <th className="px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-widest">Spent</th>
                     <th className="px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-widest text-right">Time</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {history.slice(0, 100).map((entry, i) => (
                    <motion.tr
                      key={entry.card.instanceId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => onCardClick?.(entry.card.id)}
                    >
                       <td className="px-6 py-4">
                          <span className="text-xs font-black text-white/10 tabular-nums">#{entry.pullNumber}</span>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-12 bg-white/5 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 relative">
                                <img src={entry.card.image} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                             </div>
                             <div>
                                <p className="text-xs font-black text-white group-hover:text-primary transition-colors">{entry.card.name}</p>
                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">{entry.card.group}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${getGradeStyle(entry.card.grade as Grade)}`}>
                             {entry.card.grade}
                          </span>
                       </td>
                       <td className="px-6 py-4">
                          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{entry.banner}</span>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                             <Coins className="w-3 h-3 text-accent" />
                             <span className="text-xs font-black text-white/60 tabular-nums">{entry.currencySpent}</span>
                          </div>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <span className="text-[10px] font-bold text-white/20 tabular-nums">
                             {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                       </td>
                    </motion.tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
