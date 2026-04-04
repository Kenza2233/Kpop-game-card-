'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Coins, LayoutGrid, Heart } from 'lucide-react';
import { useGame } from '../context/GameContext';

export function Navbar() {
  const pathname = usePathname();
  const { userStats } = useGame();

  const links = [
    { href: '/', icon: Heart, label: 'Gacha' },
    { href: '/collection', icon: LayoutGrid, label: 'Collection' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card-bg/80 backdrop-blur-xl border-t border-white/10 px-6 py-4 md:top-0 md:bottom-auto md:border-b md:border-t-0 shadow-2xl">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="hidden md:block">
          <Link href="/" className="text-2xl font-black kpop-gradient bg-clip-text text-transparent">
            KPOP GACHA
          </Link>
        </div>

        <div className="flex items-center gap-8 md:gap-12 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-6">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 font-bold transition-all px-3 py-2 rounded-lg ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm uppercase tracking-widest">{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2 bg-accent/20 border border-accent/20 px-4 py-2 rounded-full text-accent font-black shadow-lg">
            <Coins className="w-5 h-5 fill-accent" />
            <span className="text-sm md:text-base tabular-nums">
              {userStats.credits.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
