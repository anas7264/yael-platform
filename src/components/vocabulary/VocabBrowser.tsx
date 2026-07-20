'use client';

import { useState } from 'react';
import Search from 'lucide-react/dist/esm/icons/search';
import List from 'lucide-react/dist/esm/icons/list';
import Grid from 'lucide-react/dist/esm/icons/grid';
import Star from 'lucide-react/dist/esm/icons/star';
import { HebrewIsland } from '@/components/ui/HebrewIsland';

interface VocabWord {
  id: string;
  hebrew_word: string;
  arabic_meaning: string;
  fsrs_state?: number;
  difficulty_level?: number;
}

interface VocabBrowserProps {
  words: VocabWord[];
}

export function VocabBrowser({ words }: VocabBrowserProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterState, setFilterState] = useState<string>('all');

  const filteredWords = words.filter((w) => {
    const matchesSearch = 
      w.hebrew_word.includes(searchTerm) || 
      w.arabic_meaning.includes(searchTerm);
    const matchesState = filterState === 'all' || w.fsrs_state?.toString() === filterState;
    return matchesSearch && matchesState;
  });

  const getFSRSStateBadge = (state?: number) => {
    switch(state) {
      case 0: return <span className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-600">جديد</span>;
      case 1: return <span className="px-2 py-0.5 rounded text-xs bg-amber-500/10 text-amber-600">تعلم</span>;
      case 2: return <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-600">مراجعة</span>;
      case 3: return <span className="px-2 py-0.5 rounded text-xs bg-rose-500/10 text-rose-600">إعادة</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-bg-secondary p-4 rounded-xl border border-border-subtle">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="ابحث بالعبرية أو العربية..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-bg-tertiary border border-border-subtle rounded-lg py-2 pr-10 pl-4 text-sm focus:outline-none focus:border-primary-500"
          />
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <select 
            value={filterState} 
            onChange={(e) => setFilterState(e.target.value)}
            className="bg-bg-tertiary border border-border-subtle rounded-lg py-2 px-3 text-sm flex-1 sm:flex-none"
          >
            <option value="all">كل الحالات</option>
            <option value="0">جديد</option>
            <option value="1">قيد التعلم</option>
            <option value="2">للمراجعة</option>
            <option value="3">إعادة تعلم</option>
          </select>

          <div className="flex items-center gap-1 bg-bg-tertiary border border-border-subtle rounded-lg p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-bg-secondary shadow-sm text-primary-500' : 'text-text-tertiary hover:text-text-primary'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-bg-secondary shadow-sm text-primary-500' : 'text-text-tertiary hover:text-text-primary'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-3'}>
        {filteredWords.map((word) => (
          <div key={word.id} className={`bg-bg-secondary border border-border-subtle rounded-xl p-4 hover:border-primary-500/50 transition-colors ${viewMode === 'list' ? 'flex items-center justify-between' : 'flex flex-col'}`}>
            <div className={viewMode === 'list' ? 'flex items-center gap-6' : 'mb-4'}>
              <div>
                <HebrewIsland className="text-xl font-bold mb-1 block">
                  {word.hebrew_word}
                </HebrewIsland>
                <p className="text-text-secondary">{word.arabic_meaning}</p>
              </div>
            </div>
            
            <div className={`flex items-center gap-2 ${viewMode === 'list' ? '' : 'mt-auto pt-4 border-t border-border-subtle justify-between'}`}>
              {getFSRSStateBadge(word.fsrs_state)}
              <div className="flex items-center text-yellow-500 text-xs gap-0.5" dir="ltr">
                {[...Array(word.difficulty_level || 1)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
              </div>
            </div>
          </div>
        ))}
        {filteredWords.length === 0 && (
          <div className="col-span-full py-12 text-center text-text-tertiary">
            لا توجد كلمات مطابقة للبحث.
          </div>
        )}
      </div>
    </div>
  );
}
