'use client';

import { useCollection } from '@/context/CollectionContext';
import { useCardCollection } from '@/hooks/useCardCollection';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { FilterBar } from '@/components/FilterBar';
import { CardGrid } from '@/components/CardGrid';
import { StatsPanel } from '@/components/StatsPanel';
import { CardModal } from '@/components/CardModal';
import { useState, useMemo } from 'react';
import { GradeFilter, CategoryFilter, SortOption, OwnedCard } from '@/lib/types';
import { Search } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export default function CollectionPage() {
  const { state, exportCollection, importCollection, convertDuplicates } = useCollection();
  const { cards, loading } = useCardCollection();

  const [gradeFilter, setGradeFilter] = useState<GradeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<OwnedCard | null>(null);

  const filteredCards = useMemo(() => {
    let result = [...state.ownedCards];

    if (gradeFilter !== 'all') {
      result = result.filter(c => c.grade === gradeFilter);
    }

    if (categoryFilter !== 'all') {
      result = result.filter(c => c.category === categoryFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'newest': return b.acquiredAt - a.acquiredAt;
        case 'group': return a.group.localeCompare(b.group);
        case 'grade-desc': {
            const grades: Record<string, number> = { 'UR': 4, 'SSR': 3, 'SR': 2, 'R': 1 };
            return grades[b.grade!] - grades[a.grade!];
        }
        case 'grade-asc': {
            const grades: Record<string, number> = { 'UR': 4, 'SSR': 3, 'SR': 2, 'R': 1 };
            return grades[a.grade!] - grades[b.grade!];
        }
        default: return 0;
      }
    });

    return result;
  }, [state.ownedCards, gradeFilter, categoryFilter, searchQuery, sortOption]);

  const totalUnique = new Set(state.ownedCards.map(c => c.id)).size;

  return (
    <div className="min-h-screen bg-background">
      <Header currency={state.currency} totalCards={state.ownedCards.length} sparkPoints={0} />

      <div className="max-w-7xl mx-auto px-6">
         <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase">My Collection</h1>
            <div className="relative w-full md:w-80 group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
               <input
                 type="text"
                 placeholder="Search by name or group..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all shadow-xl"
               />
            </div>
         </div>
      </div>

      <FilterBar
        gradeFilter={gradeFilter}
        categoryFilter={categoryFilter}
        sortOption={sortOption}
        onGradeChange={setGradeFilter}
        onCategoryChange={setCategoryFilter}
        onSortChange={setSortOption}
        resultCount={{ showing: filteredCards.length, total: state.ownedCards.length }}
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 px-6">
         <div className="lg:col-span-8">
            <CardGrid
              cards={filteredCards}
              loading={loading}
              onCardClick={(c) => setSelectedCard(c as OwnedCard)}
            />
         </div>
         <aside className="lg:col-span-4 lg:sticky lg:top-[160px] h-fit">
            <StatsPanel
               state={state}
               totalUniqueCards={totalUnique}
               totalCardsInGame={cards?.length || 0}
               onExport={() => {
                  const data = exportCollection();
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `kpop_collection.json`;
                  a.click();
               }}
               onImport={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.onchange = (e: any) => {
                     const file = e.target.files[0];
                     const reader = new FileReader();
                     reader.onload = (re) => {
                        const data = re.target?.result as string;
                        if (importCollection(data)) {
                           alert('Collection imported successfully!');
                        } else {
                           alert('Failed to import collection.');
                        }
                     };
                     reader.readAsText(file);
                  };
                  input.click();
               }}
               onConvertDuplicates={() => {
                  const { cardsRemoved, coinsGained } = convertDuplicates();
                  if (cardsRemoved > 0) {
                     alert(`Successfully converted ${cardsRemoved} duplicates for ${coinsGained} coins!`);
                  }
               }}
            />
         </aside>
      </div>

      <AnimatePresence>
        {selectedCard && (
           <CardModal
             card={selectedCard}
             onClose={() => setSelectedCard(null)}
             ownedCopies={state.ownedCards.filter(c => c.id === selectedCard.id).length}
           />
        )}
      </AnimatePresence>

      <MobileNav />
    </div>
  );
}
