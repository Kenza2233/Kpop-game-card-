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

      // Clean, Deduplicate, Process (generate IDs)
      const cleaned = rawCards.map(c => ({ ...c, name: cleanIdolName(c.name) }));
      const deduplicated = deduplicateCards(cleaned);
      const processed = processCards(deduplicated);

      // Assign Random Grades (initial distribution)
      const withGrades = assignRandomGrades(processed);

      cachedCards = withGrades;
      setCards(withGrades);
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
