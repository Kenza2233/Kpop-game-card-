import ZAI from 'z-ai-web-dev-sdk';

const idols = [
  "BTS Jungkook", "BTS V", "BTS Jimin", "BTS Jin", "BTS Suga", "BTS J-Hope", "BTS RM",
  "BLACKPINK Lisa", "BLACKPINK Jennie", "BLACKPINK Rosé", "BLACKPINK Jisoo",
  "TWICE Nayeon", "TWICE Momo", "TWICE Sana", "TWICE Jihyo", "TWICE Mina", "TWICE Dahyun", "TWICE Chaeyoung", "TWICE Tzuyu", "TWICE Jeongyeon",
  "NewJeans Minji", "NewJeans Hanni", "NewJeans Danielle", "NewJeans Haerin", "NewJeans Hyein",
  "IVE Wonyoung", "IVE Yujin", "IVE Rei", "IVE Gaeul", "IVE Liz", "Leeseo",
  "aespa Karina", "aespa Winter", "aespa Giselle", "aespa Ningning",
  "Stray Kids Hyunjin", "Stray Kids Felix", "Stray Kids Bang Chan", "Stray Kids Lee Know", "Stray Kids Changbin", "Stray Kids Han", "Stray Kids Seungmin", "Stray Kids I.N",
  "Le Sserafim Sakura", "Le Sserafim Chaewon", "Le Sserafim Yunjin", "Le Sserafim Kazuha", "Le Sserafim Eunchae",
  "Red Velvet Irene", "Red Velvet Seulgi", "Red Velvet Wendy", "Red Velvet Joy", "Red Velvet Yeri"
];

async function find() {
  const z = await (ZAI as any).create();
  const results: Record<string, string> = {};

  for (const idol of idols) {
    console.log(`Searching for ${idol}...`);
    try {
      const searchResults: any = await z.functions.invoke('web_search', {
        query: `${idol} kpop profile photo pinterest pin`,
      });

      let found = false;
      if (Array.isArray(searchResults)) {
        for (const res of searchResults) {
          const url = res.url || res.link || '';
          if (url.includes('pinimg.com') || url.includes('pinterest.com/pin/')) {
            results[idol.replace(/\s+/g, '_')] = url;
            found = true;
            break;
          }
        }
      }
      if (!found) {
         console.log(`No Pinterest URL found for ${idol}`);
         // Fallback to first result if any
         if (searchResults && searchResults[0]) {
             results[idol.replace(/\s+/g, '_')] = searchResults[0].url || searchResults[0].link;
         }
      }
    } catch (e) {
      console.error(`Error searching for ${idol}:`, e);
    }
  }

  console.log(JSON.stringify(results, null, 2));
}

find();
