import { CollectionProvider } from '@/context/CollectionContext';
import { Navbar } from '@/components/Navbar';
import './globals.css';

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
    <html lang="en" className="dark">
      <body className="antialiased pb-24 md:pb-0 md:pt-20">
        <CollectionProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
        </CollectionProvider>
      </body>
    </html>
  );
}
