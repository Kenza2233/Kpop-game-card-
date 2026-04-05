import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { POPULAR_IDOLS } from '../../../lib/popular-idols';

// In-memory cache to avoid repeated searches
const imageCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

let zaiInstance: any = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await (ZAI as any).create();
  }
  return zaiInstance;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const group = searchParams.get('group') || '';
  const idol = searchParams.get('idol') || '';

  const cacheKey = `${group}_${idol}`.toLowerCase().replace(/\s+/g, '_');

  // Check cache first
  const cached = imageCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json({ imageUrl: cached.url, cached: true });
  }

  // Check popular idols map
  const popularKey = `${group}_${idol}`.replace(/\s+/g, '_');
  if (POPULAR_IDOLS[popularKey]) {
    imageCache.set(cacheKey, { url: POPULAR_IDOLS[popularKey], timestamp: Date.now() });
    return NextResponse.json({ imageUrl: POPULAR_IDOLS[popularKey], cached: false });
  }

  // Use web search fallback
  try {
    const z = await getZAI();
    const searchQuery = `${group} ${idol} kpop profile photo pinterest pin`;
    const results: any = await z.functions.invoke("web_search", {
      query: searchQuery,
      num: 5
    });

    let imageUrl = null;
    if (Array.isArray(results)) {
      for (const result of results) {
        const url = result.url || result.link || '';
        if (
          url.includes('pinimg.com') ||
          url.includes('pinterest.com/pin/') ||
          url.includes('googleusercontent.com')
        ) {
          imageUrl = url;
          break;
        }
      }

      if (!imageUrl && results.length > 0) {
        imageUrl = results[0].url || results[0].link;
      }
    }

    if (imageUrl) {
      imageCache.set(cacheKey, { url: imageUrl, timestamp: Date.now() });
      return NextResponse.json({ imageUrl, cached: false });
    }

    return NextResponse.json({ imageUrl: null, cached: false });
  } catch (error) {
    console.error('Image search error:', error);
    return NextResponse.json({ imageUrl: null, cached: false, error: 'Search failed' });
  }
}
