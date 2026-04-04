'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GradeFilter, CategoryFilter, SortOption } from '../lib/types';
import { ChevronDown, Search } from 'lucide-react';

interface FilterBarProps {
  gradeFilter: GradeFilter;
  categoryFilter: CategoryFilter;
  sortOption: SortOption;
  onGradeChange: (grade: GradeFilter) => void;
  onCategoryChange: (category: CategoryFilter) => void;
  onSortChange: (sort: SortOption) => void;
  resultCount: { showing: number; total: number };
}

export function FilterBar({
  gradeFilter,
  categoryFilter,
  sortOption,
  onGradeChange,
  onCategoryChange,
  onSortChange,
  resultCount
}: FilterBarProps) {

  const grades: GradeFilter[] = ['all', 'R', 'SR', 'SSR', 'UR'];
  const categories: CategoryFilter[] = ['all', 'Girl Group', 'Boy Group', 'Female Solo', 'Male Solo'];
  const sorts: { value: SortOption; label: string }[] = [
    { value: 'name-asc', label: 'Name A-Z' },
    { value: 'name-desc', label: 'Name Z-A' },
    { value: 'grade-desc', label: 'Grade ↓' },
    { value: 'grade-asc', label: 'Grade ↑' },
    { value: 'newest', label: 'Newest' },
    { value: 'group', label: 'Group' },
  ];

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'UR': return 'bg-yellow-400 text-black';
      case 'SSR': return 'bg-purple-400 text-white';
      case 'SR': return 'bg-blue-400 text-white';
      case 'R': return 'bg-emerald-400 text-black';
      default: return 'bg-white/10 text-white/40 hover:text-white';
    }
  };

  return (
    <div className="w-full bg-card-bg/40 backdrop-blur-xl border-y border-white/5 py-4 px-6 sticky top-[64px] z-40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Left: Filters */}
        <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto overflow-x-auto no-scrollbar">

          {/* Grade Filters */}
          <div className="flex items-center gap-2">
             {grades.map((grade) => (
               <button
                 key={grade}
                 onClick={() => onGradeChange(grade)}
                 className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                   gradeFilter === grade
                     ? getGradeColor(grade) + ' shadow-lg scale-105'
                     : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                 }`}
               >
                 {grade}
               </button>
             ))}
          </div>

          <div className="h-6 w-[1px] bg-white/10 hidden md:block" />

          {/* Category Filters */}
          <div className="flex items-center gap-2">
             {categories.map((cat) => (
               <button
                 key={cat}
                 onClick={() => onCategoryChange(cat)}
                 className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                   categoryFilter === cat
                     ? 'bg-primary text-white shadow-lg scale-105'
                     : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                 }`}
               >
                 {cat}
               </button>
             ))}
          </div>
        </div>

        {/* Right: Sort & Count */}
        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t border-white/5 pt-4 md:pt-0 md:border-none">
           <div className="relative group">
              <select
                value={sortOption}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-all appearance-none pr-10 outline-none cursor-pointer"
              >
                 {sorts.map(s => <option key={s.value} value={s.value} className="bg-slate-900">{s.label}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
           </div>

           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Results</span>
              <span className="text-sm font-black text-white italic tracking-tighter">
                {resultCount.showing} <span className="text-white/20">/ {resultCount.total}</span>
              </span>
           </div>
        </div>

      </div>
    </div>
  );
}
