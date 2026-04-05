'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Coins, Sparkles, Settings, LayoutGrid, Heart, History, Home, Crown } from 'lucide-react';
import { formatNumber } from '../lib/cardUtils';
import { useCollection } from '../context/CollectionContext';
import PasswordModal from './PasswordModal';

interface HeaderProps {
  currency: number;
  totalCards: number;
  sparkPoints: number;
}

export function Header({ currency, sparkPoints, totalCards }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { tapLogo, state } = useCollection();

  const navLinks = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/gacha', icon: Heart, label: 'Gacha' },
    { href: '/collection', icon: LayoutGrid, label: 'Collection' },
    { href: '/history', icon: History, label: 'History' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Logo */}
        <motion.div
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            tapLogo();
            if (pathname !== '/') router.push('/');
          }}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
             <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm md:text-xl font-black italic tracking-tighter text-white uppercase select-none">
            KPOP <span className="text-primary">COLLECTION</span>
          </span>
        </motion.div>

        {/* Center: Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary shadow-lg shadow-primary/5'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Badges & Settings */}
        <div className="flex items-center gap-3">
          {state.unlimitedMode ? (
            <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/50 px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.2)]">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-[10px] md:text-xs font-black text-yellow-400 uppercase tracking-tighter">
                ∞ UNLIMITED
              </span>
              <span className="hidden md:inline-block text-[8px] bg-yellow-400/20 text-yellow-400 px-1 rounded font-black">
                CHEAT
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-full shadow-lg">
              <Coins className="w-4 h-4 text-accent fill-accent/20" />
              <span className="text-xs md:text-sm font-black text-accent tabular-nums">
                {formatNumber(currency)}
              </span>
            </div>
          )}

          <div className="hidden md:flex items-center gap-2 bg-secondary/10 border border-secondary/20 px-3 py-1.5 rounded-full shadow-lg">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-xs md:text-sm font-black text-secondary tabular-nums">
              {sparkPoints}
            </span>
          </div>

          <button className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
      <PasswordModal />
    </header>
  );
}
