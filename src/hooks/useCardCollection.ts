'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { KpopCard } from '../lib/types';
import { cleanIdolName, deduplicateCards, assignRandomGrades, processCards } from '../lib/cardUtils';
import { fetchCardData } from '../lib/dataFetcher';

let cachedCards: KpopCard[] | null = null;

export function useCardCollection() {
  const [cards, setCards] = useState<KpopCard[]>(cachedCards || []);
  const [loading, setLoading] = useState(!cachedCards);
  const [error, setError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const loadData = useCallback(async (force = false) => {
    if (cachedCards && !force) {
      setCards(cachedCards);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchCardData('/data/kpop_data.json');
      const rawCards: KpopCard[] = Array.isArray(data) ? data : (data as any).cards || [];

      // The data is already cleaned and processed by the transform script,
      // but we ensure grades are valid and IDs are present just in case.
      const validGrades = ['UR', 'SSR', 'SR', 'R'];
      const processed = rawCards.map(c => ({
        ...c,
        grade: (c.grade && validGrades.includes(c.grade)) ? c.grade : 'R'
      }));

      cachedCards = processed;
      setCards(processed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load card data');
      console.error('Error in useCardCollection:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const trackFailedImage = useCallback((url: string) => {
    setFailedImages(prev => {
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  }, []);

  return {
    cards,
    loading,
    error,
    refetch: () => loadData(true),
    failedImages,
    trackFailedImage,
  };
}
