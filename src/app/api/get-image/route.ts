import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// Global cache to persist search results within the same instance
const imageCache = new Map<string, string>();
let zaiInstance: any = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await (ZAI as any).create();
  }
  return zaiInstance;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const group = searchParams.get('group');
  const idol = searchParams.get('idol');

  if (!group || !idol) {
    return NextResponse.json({ error: 'Missing group or idol parameter' }, { status: 400 });
  }

  const cacheKey = `${group.toLowerCase()}_${idol.toLowerCase()}`;

  if (imageCache.has(cacheKey)) {
    return NextResponse.redirect(imageCache.get(cacheKey) as string);
  }

  const query = `${group} ${idol} kpop profile photo pinterest`;

  try {
    const z = await getZAI();
    const results: any = await z.functions.invoke('web_search', {
      query,
    });

    let imageUrl: string | null = null;

    if (results && Array.isArray(results)) {
       for (const res of results) {
          const url = res.url || res.link || '';
          if (
            url.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) ||
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
      imageCache.set(cacheKey, imageUrl);
      return NextResponse.redirect(imageUrl);
    }

    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
