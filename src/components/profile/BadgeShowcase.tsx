'use client';

import { useState, memo } from 'react';
import Lock from 'lucide-react/dist/esm/icons/lock';
import Award from 'lucide-react/dist/esm/icons/award';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji or identifier
  earned_at: string | null;
  progress: number; // 0-100
}

interface BadgeShowcaseProps {
  badges: Badge[];
}

export const BadgeShowcase = memo(function BadgeShowcase({ badges }: BadgeShowcaseProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const earnedCount = badges.filter(b => b.earned_at).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Award className="w-6 h-6 text-primary-500" />
          الأوسمة والإنجازات
        </h2>
        <span className="text-sm font-bold text-primary-500 bg-primary-500/10 px-3 py-1 rounded-full">
          {earnedCount} / {badges.length}
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {badges.map(badge => {
          const isEarned = !!badge.earned_at;
          
          return (
            <button
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-2 transition-all hover:scale-105 active:scale-95 ${
                isEarned 
                  ? 'border-primary-500/30 bg-primary-500/5 hover:border-primary-500' 
                  : 'border-border-subtle bg-bg-tertiary grayscale hover:grayscale-0 hover:border-text-tertiary'
              }`}
            >
              <div className="text-4xl mb-2">{badge.icon}</div>
              <p className={`text-xs font-bold text-center line-clamp-2 leading-tight ${isEarned ? 'text-text-primary' : 'text-text-tertiary'}`}>
                {badge.name}
              </p>
              {!isEarned && (
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-bg-tertiary border border-border-subtle flex items-center justify-center text-text-tertiary shadow-sm">
                  <Lock className="w-3 h-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Badge Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm animate-fade-in">
          <Card className="max-w-sm w-full p-6 text-center space-y-4 relative border-border-subtle shadow-2xl">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-6xl shadow-inner ${
              selectedBadge.earned_at ? 'bg-primary-500/10 border-4 border-primary-500/30' : 'bg-bg-tertiary border-4 border-border-subtle grayscale'
            }`}>
              {selectedBadge.icon}
            </div>
            
            <div>
              <h3 className="text-xl font-bold">{selectedBadge.name}</h3>
              <p className="text-sm text-text-secondary mt-2">{selectedBadge.description}</p>
            </div>

            {!selectedBadge.earned_at && (
              <div className="space-y-2 pt-4">
                <div className="flex justify-between text-xs font-bold text-text-secondary">
                  <span>التقدم</span>
                  <span>{selectedBadge.progress}%</span>
                </div>
                <div className="h-2 w-full bg-bg-tertiary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 transition-all"
                    style={{ width: `${selectedBadge.progress}%` }}
                  />
                </div>
              </div>
            )}

            {selectedBadge.earned_at && (
              <p className="text-xs font-bold text-emerald-500 pt-2" dir="ltr">
                تم الحصول عليه: {new Date(selectedBadge.earned_at).toLocaleDateString('ar')}
              </p>
            )}

            <Button variant="secondary" className="w-full mt-4" onClick={() => setSelectedBadge(null)}>
              إغلاق
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
});
