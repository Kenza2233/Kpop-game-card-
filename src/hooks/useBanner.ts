'use client';

import { useState, useEffect, useMemo } from 'react';
import { Banner } from '../lib/types';

const INITIAL_BANNERS: Banner[] = [
  {
    id: 'standard_1',
    name: 'KPOP Standard Banner',
    type: 'standard',
    description: 'Pull all your favorite idols from the standard pool!',
    startDate: '2023-01-01',
    endDate: '2025-12-31',
    image: 'https://images.unsplash.com/photo-1619983081563-430f63602796?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'featured_1',
    name: 'aespa Rate Up!',
    type: 'featured',
    description: '50% chance for aespa members on UR/SSR pulls!',
    rateUpCards: ['1', '2'], // Mock IDs
    startDate: '2024-03-01',
    endDate: '2024-03-07',
    image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'limited_1',
    name: 'Born Pink Exclusive',
    type: 'limited',
    description: 'Limited edition BLACKPINK cards! Only available for 14 days.',
    startDate: '2024-03-01',
    endDate: '2024-03-14',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
  },
];

export function useBanner() {
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [activeBannerId, setActiveBannerId] = useState<string>(INITIAL_BANNERS[0].id);

  const activeBanners = useMemo(() => {
    const now = new Date().getTime();
    return banners.filter(b => {
      const start = new Date(b.startDate).getTime();
      const end = new Date(b.endDate).getTime();
      return now >= start && now <= end;
    });
  }, [banners]);

  const currentBanner = useMemo(() => {
    return activeBanners.find(b => b.id === activeBannerId) || activeBanners[0];
  }, [activeBanners, activeBannerId]);

  return {
    banners: activeBanners,
    currentBanner,
    setActiveBannerId,
    allBanners: banners
  };
}
