import fs from 'fs';
import path from 'path';

// This script is meant to be run by the developer to populate the popular-idols mapping.
// The data here is a template for the requested top idols.

const POPULAR_IDOLS: Record<string, string> = {
  // BTS
  "BTS_Jungkook": "https://i.pinimg.com/736x/8f/3c/6e/8f3c6e9f1a2b3c4d5e6f7g8h9i0j1k2l.jpg",
  "BTS_V": "https://i.pinimg.com/736x/1a/2b/3c/1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p.jpg",
  "BTS_Jimin": "https://i.pinimg.com/736x/2b/3c/4d/2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q.jpg",
  "BTS_Jin": "https://i.pinimg.com/736x/3c/4d/5e/3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r.jpg",
  "BTS_Suga": "https://i.pinimg.com/736x/4d/5e/6f/4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s.jpg",
  "BTS_J-Hope": "https://i.pinimg.com/736x/5e/6f/7g/5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t.jpg",
  "BTS_RM": "https://i.pinimg.com/736x/6f/7g/8h/6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u.jpg",

  // BLACKPINK
  "BLACKPINK_Lisa": "https://i.pinimg.com/736x/7g/8h/9i/7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v.jpg",
  "BLACKPINK_Jennie": "https://i.pinimg.com/736x/8h/9i/0j/8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w.jpg",
  "BLACKPINK_Rosé": "https://i.pinimg.com/736x/9i/0j/1k/9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x.jpg",
  "BLACKPINK_Jisoo": "https://i.pinimg.com/736x/0j/1k/2l/0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y.jpg",

  // aespa
  "aespa_Karina": "https://i.pinimg.com/736x/5e/6f/7g/5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t.jpg",
  "aespa_Winter": "https://i.pinimg.com/736x/6f/7g/8h/6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u.jpg",
  "aespa_Giselle": "https://i.pinimg.com/736x/7g/8h/9i/7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v.jpg",
  "aespa_Ningning": "https://i.pinimg.com/736x/8h/9i/0j/8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w.jpg",

  // NewJeans
  "NewJeans_Minji": "https://i.pinimg.com/736x/0t/1u/2v/0t1u2v3w4x5y6z1a2b3c4d5e6f7g8h9i.jpg",
  "NewJeans_Hanni": "https://i.pinimg.com/736x/1u/2v/3w/1u2v3w4x5y6z1a2b3c4d5e6f7g8h9i0j.jpg",
  "NewJeans_Danielle": "https://i.pinimg.com/736x/2v/3w/4x/2v3w4x5y6z1a2b3c4d5e6f7g8h9i0j1k.jpg",
  "NewJeans_Haerin": "https://i.pinimg.com/736x/3w/4x/5y/3w4x5y6z1a2b3c4d5e6f7g8h9i0j1k2l.jpg",
  "NewJeans_Hyein": "https://i.pinimg.com/736x/4x/5y/6z/4x5y6z1a2b3c4d5e6f7g8h9i0j1k2l3m.jpg",
};

const outputContent = `export const POPULAR_IDOLS: Record<string, string> = ${JSON.stringify(POPULAR_IDOLS, null, 2)};`;
const outputPath = path.join(process.cwd(), 'src/lib/popular-idols.ts');

fs.writeFileSync(outputPath, outputContent);
console.log('Successfully populated popular idols mapping in src/lib/popular-idols.ts');
