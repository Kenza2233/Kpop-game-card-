'use client';

import { useState, useEffect } from 'react';

interface UseIdolImageResult {
  imageUrl: string | null;
  isLoading: boolean;
  isCached: boolean;
  error: string | null;
}

const localCache = new Map<string, string>();

export function useIdolImage(group: string, idol: string): UseIdolImageResult {
  const [result, setResult] = useState<UseIdolImageResult>({
    imageUrl: null,
    isLoading: true,
    isCached: false,
    error: null,
  });

  useEffect(() => {
    if (!group || !idol) return;

    const cacheKey = `${group}_${idol}`.toLowerCase().replace(/\s+/g, '_');

    if (localCache.has(cacheKey)) {
      setResult({
        imageUrl: localCache.get(cacheKey)!,
        isLoading: false,
        isCached: true,
        error: null,
      });
      return;
    }

    let isMounted = true;

    async function fetchImage() {
      setResult(prev => ({ ...prev, isLoading: true }));
      try {
        const response = await fetch(`/api/get-image?group=${encodeURIComponent(group)}&idol=${encodeURIComponent(idol)}`);
        if (!response.ok) throw new Error('Failed to fetch image');

        const data = await response.json();

        if (isMounted) {
          if (data.imageUrl) {
            localCache.set(cacheKey, data.imageUrl);
          }
          setResult({
            imageUrl: data.imageUrl,
            isLoading: false,
            isCached: !!data.cached,
            error: null,
          });
        }
      } catch (err) {
        if (isMounted) {
          setResult({
            imageUrl: null,
            isLoading: false,
            isCached: false,
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }
    }

    fetchImage();

    return () => {
      isMounted = false;
    };
  }, [group, idol]);

  return result;
}
