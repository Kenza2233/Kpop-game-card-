'use client';

import { useCollection } from '@/context/CollectionContext';
import { useBanner } from '@/hooks/useBanner';
import { useCardCollection } from '@/hooks/useCardCollection';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, Heart, Trophy, Info, ChevronRight, Zap } from 'lucide-react';
import { formatNumber } from '@/lib/cardUtils';

export default function Home() {
  const { state } = useCollection();
  const { currentBanner } = useBanner();
  const { cards } = useCardCollection();

  const totalUnique = new Set(state.ownedCards.map(c => c.id)).size;
  const completionRate = (totalUnique / (cards?.length || 1)) * 100;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Header
        currency={state.currency}
        totalCards={state.ownedCards.length}
        sparkPoints={currentBanner ? (state.sparkPoints[currentBanner.id] || 0) : 0}
      />

      {/* Hero Section */}
      <section className="relative h-[80vh] flex flex-col items-center justify-center overflow-hidden px-6">
         {/* Background Particles */}
         <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, x: Math.random() * 1000 - 500, y: Math.random() * 1000 - 500 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  y: [null, -200],
                  rotate: [0, 360]
                }}
                transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 5 }}
                className="absolute w-16 h-20 bg-primary/10 rounded-lg border border-primary/20 backdrop-blur-sm"
              />
            ))}
         </div>

         <div className="relative z-10 text-center max-w-4xl">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
               <div className="h-px w-12 bg-primary/40" />
               <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-primary">KPOP Card Collection</span>
               <div className="h-px w-12 bg-primary/40" />
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl lg:text-[120px] font-black italic tracking-tighter text-white uppercase leading-[0.85] mb-8"
            >
              COLLECT <br /> <span className="text-primary group relative inline-block">THE STARS<span className="absolute -bottom-2 left-0 w-full h-2 bg-primary/20 blur-xl" /></span>
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm md:text-lg text-white/40 font-medium max-w-2xl mx-auto mb-12 uppercase tracking-widest"
            >
              The ultimate gacha experience for KPOP fans. Pull rare cards, complete your collection, and become the dedicated collector.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
               <Link href="/gacha" className="w-full sm:w-auto px-12 py-5 kpop-gradient rounded-full font-black text-xl text-white shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group">
                  <Heart className="w-6 h-6 group-hover:fill-white transition-all" />
                  PULL NOW
               </Link>
               <Link href="/collection" className="w-full sm:w-auto px-12 py-5 bg-white/5 border border-white/10 rounded-full font-black text-xl text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                  <Sparkles className="w-6 h-6 text-primary" />
                  COLLECTION
               </Link>
            </motion.div>
         </div>

         {/* Hero Bottom Stats */}
         <div className="absolute bottom-12 left-0 right-0 px-6">
            <div className="max-w-7xl mx-auto flex flex-wrap justify-center md:justify-between items-center gap-8">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Unique Collected</span>
                  <span className="text-2xl font-black text-white italic tracking-tighter">{totalUnique} <span className="text-white/20 text-sm">/ {cards?.length || 0}</span></span>
               </div>
               <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Completion</span>
                  <span className="text-2xl font-black text-primary italic tracking-tighter">{Math.round(completionRate)}%</span>
               </div>
               <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Credits</span>
                  <span className="text-2xl font-black text-accent italic tracking-tighter">{formatNumber(state.currency)}</span>
               </div>
            </div>
         </div>
      </section>

      {/* Featured Banner Preview */}
      {currentBanner && (
        <section className="py-24 px-6 bg-white/[0.02]">
           <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative aspect-[16/9] rounded-[40px] overflow-hidden shadow-2xl border border-white/5">
                 <img src={currentBanner.image} className="w-full h-full object-cover" alt="" />
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Zap className="w-20 h-20 text-white/20 animate-pulse" />
                 </div>
              </div>
              <div>
                 <span className="bg-primary/20 text-primary px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20 mb-4 inline-block">Featured Banner</span>
                 <h2 className="text-5xl font-black italic tracking-tighter text-white uppercase mb-4">{currentBanner.name}</h2>
                 <p className="text-lg text-white/40 mb-8 max-w-lg">{currentBanner.description}</p>
                 <Link href="/gacha" className="inline-flex items-center gap-3 text-white font-black hover:text-primary transition-colors group">
                    View Banner Details <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                 </Link>
              </div>
           </div>
        </section>
      )}

      {/* How to Play */}
      <section className="py-32 px-6">
         <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase mb-16 text-center">How to Play</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { title: 'Gacha System', desc: 'Use your credits to pull for idols. Each pull increases your pity counter for guaranteed high-rarity cards.', icon: Heart },
                 { title: 'Spark System', desc: 'Earn spark points with every pull. Reach 200 points to claim any card of your choice from the active banner.', icon: Zap },
                 { title: 'Achievements', desc: 'Complete special milestones like unique count or streaks to earn massive credit bonuses.', icon: Trophy },
               ].map((step, i) => (
                 <div key={i} className="bg-white/5 border border-white/5 rounded-[32px] p-8 hover:bg-white/10 transition-colors">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                       <step.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black italic tracking-tighter text-white uppercase mb-3">{step.title}</h3>
                    <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      <MobileNav />
    </div>
  );
}
