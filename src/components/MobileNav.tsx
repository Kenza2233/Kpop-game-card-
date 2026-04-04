'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Heart, History, User } from 'lucide-react';
import { motion } from 'framer-motion';

export function MobileNav() {
  const pathname = usePathname();

  const tabs = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/gacha', icon: Heart, label: 'Gacha' },
    { href: '/collection', icon: LayoutGrid, label: 'Cards' },
    { href: '/history', icon: History, label: 'Logs' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-card-bg/80 backdrop-blur-2xl border-t border-white/10 px-4 pb-safe-offset-2">
      <div className="flex items-center justify-around py-3">
        {tabs.map((tab) => {
          const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link key={tab.href} href={tab.href} className="flex flex-col items-center gap-1 relative px-4">
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-pill"
                  className="absolute -top-1 w-12 h-1 bg-primary rounded-full"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className={`w-6 h-6 transition-colors ${isActive ? 'text-primary' : 'text-white/20'}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-white' : 'text-white/20'}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
