import { CollectionProvider } from '@/context/CollectionContext';
import { AchievementProvider } from '@/components/AchievementToast';
import { Righteous, Inter } from 'next/font/google';
import './globals.css';

const righteous = Righteous({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-righteous',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'KPOP Gacha Game',
  description: 'Collect your favorite idols in this ultimate Gacha game.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${righteous.variable} ${inter.variable}`}>
      <body className="antialiased font-body bg-kpop-dark text-white pb-24 md:pb-0">
        <CollectionProvider>
          <AchievementProvider>
            <main className="min-h-screen">
              {children}
            </main>
          </AchievementProvider>
        </CollectionProvider>
      </body>
    </html>
  );
}
