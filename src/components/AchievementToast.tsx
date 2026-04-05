'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Zap } from 'lucide-react';

interface AchievementToastProps {
  id: string;
  name: string;
  description: string;
  onClose: (id: string) => void;
}

export function AchievementToast({ id, name, description, onClose }: AchievementToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 4000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="bg-slate-900 border border-primary/20 rounded-2xl p-5 shadow-2xl flex items-center gap-5 min-w-[320px] max-w-md relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors pointer-events-none" />
      <div className="absolute top-0 right-0 p-2 z-10">
         <button onClick={() => onClose(id)} className="text-white/20 hover:text-white transition-colors">
            <X className="w-4 h-4" />
         </button>
      </div>

      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary relative shadow-lg shadow-primary/20">
         <Trophy className="w-8 h-8" />
         <div className="absolute -top-1 -right-1">
            <motion.div
               animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="w-4 h-4 bg-primary rounded-full blur-[2px]"
            />
         </div>
      </div>

      <div className="flex flex-col gap-1 pr-4">
         <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-1">
            <Zap className="w-2 h-2 fill-primary" />
            Achievement Unlocked
         </span>
         <h4 className="text-sm font-black text-white italic tracking-tighter uppercase leading-none">{name}</h4>
         <p className="text-[10px] font-bold text-white/40 leading-tight">{description}</p>
      </div>

      {/* Progress bar timer */}
      <motion.div
         initial={{ width: '100%' }}
         animate={{ width: '0%' }}
         transition={{ duration: 4, ease: 'linear' }}
         className="absolute bottom-0 left-0 h-1 bg-primary/30"
      />
    </motion.div>
  );
}

const AchievementContext = React.createContext<{
  addToast: (achievement: { id: string; name: string; description: string }) => void;
} | undefined>(undefined);

export function useAchievementToasts() {
  const context = React.useContext(AchievementContext);
  if (!context) throw new Error('useAchievementToasts must be used within AchievementProvider');
  return context;
}

export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<{ id: string; name: string; description: string }[]>([]);

  const addToast = React.useCallback((achievement: { id: string; name: string; description: string }) => {
    setToasts(prev => {
      if (prev.find(t => t.id === achievement.id)) return prev;
      return [...prev, achievement];
    });
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <AchievementContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-24 right-6 z-[200] flex flex-col gap-4">
        <AnimatePresence>
          {toasts.map(toast => (
            <AchievementToast key={toast.id} {...toast} onClose={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </AchievementContext.Provider>
  );
}
