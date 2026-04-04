'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Coins, Sparkles, Settings, LayoutGrid, Heart, History, Home } from 'lucide-react';
import { formatNumber } from '../lib/cardUtils';

interface HeaderProps {
  currency: number;
  totalCards: number;
  sparkPoints: number;
}

export function Header({ currency, sparkPoints }: HeaderProps) {
  const pathname = usePathname();

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
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
             <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm md:text-xl font-black italic tracking-tighter text-white uppercase">
            KPOP <span className="text-primary">COLLECTION</span>
          </span>
        </Link>

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
          <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-full shadow-lg">
            <Coins className="w-4 h-4 text-accent fill-accent/20" />
            <span className="text-xs md:text-sm font-black text-accent tabular-nums">
              {formatNumber(currency)}
            </span>
          </div>

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
    </header>
  );
}
