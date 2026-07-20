'use client';

import { useState } from 'react';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ChevronUp from 'lucide-react/dist/esm/icons/chevron-up';
import ArrowUpDown from 'lucide-react/dist/esm/icons/arrow-up-down';

interface KC {
  id: string;
  name_arabic: string;
  mastery: number;
  attempts: number;
  last_practiced: string | null;
}

interface Section {
  name: string;
  kcs: KC[];
}

interface SkillBreakdownProps {
  sections: Section[];
}

export function SkillBreakdown({ sections }: SkillBreakdownProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<'mastery' | 'recent'>('mastery');

  const toggleSection = (name: string) => {
    setOpenSections(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const sortedSections = sections.map(sec => ({
    ...sec,
    kcs: [...sec.kcs].sort((a, b) =>
      sortBy === 'mastery'
        ? a.mastery - b.mastery
        : (b.last_practiced ?? '').localeCompare(a.last_practiced ?? '')
    ),
  }));

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 80) return 'bg-emerald-500';
    if (mastery >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setSortBy(s => s === 'mastery' ? 'recent' : 'mastery')}
          className="flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-primary-500 transition-colors px-3 py-1.5 rounded-lg bg-bg-secondary border border-border-subtle"
        >
          <ArrowUpDown className="w-4 h-4" />
          {sortBy === 'mastery' ? 'ترتيب حسب الإتقان' : 'ترتيب حسب الأحدث'}
        </button>
      </div>

      {sortedSections.map(sec => {
        const isOpen = !!openSections[sec.name];
        const avgMastery = sec.kcs.length > 0
          ? Math.round(sec.kcs.reduce((s, k) => s + k.mastery, 0) / sec.kcs.length)
          : 0;

        return (
          <div key={sec.name} className="border border-border-subtle rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection(sec.name)}
              className="w-full flex items-center justify-between p-5 bg-bg-secondary hover:bg-bg-tertiary transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="font-bold text-base">{sec.name}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 bg-bg-primary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getMasteryColor(avgMastery)} transition-all`}
                      style={{ width: `${avgMastery}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-text-secondary">{avgMastery}%</span>
                </div>
              </div>
              {isOpen ? <ChevronUp className="w-5 h-5 text-text-tertiary" /> : <ChevronDown className="w-5 h-5 text-text-tertiary" />}
            </button>

            {isOpen && (
              <div className="divide-y divide-border-subtle bg-bg-primary">
                {sec.kcs.map(kc => (
                  <div key={kc.id} className="px-5 py-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm mb-2 truncate">{kc.name_arabic}</p>
                      <div className="h-2 w-full bg-bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getMasteryColor(kc.mastery)} transition-all duration-500`}
                          style={{ width: `${kc.mastery}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-end shrink-0 space-y-1">
                      <p className="text-sm font-bold">{kc.mastery}%</p>
                      <p className="text-xs text-text-tertiary">{kc.attempts} محاولة</p>
                    </div>
                    {kc.last_practiced && (
                      <div className="text-xs text-text-tertiary shrink-0 hidden sm:block" dir="ltr">
                        {new Date(kc.last_practiced).toLocaleDateString('ar')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
