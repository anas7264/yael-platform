'use client';

import { useState, useRef } from 'react';
import Camera from 'lucide-react/dist/esm/icons/camera';
import Edit2 from 'lucide-react/dist/esm/icons/edit-2';
import Image from 'next/image';

interface ProfileHeaderProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
    created_at: string;
  };
  progress: {
    level: number;
    total_xp: number;
    next_level_xp: number;
    title: string;
  };
}

export function ProfileHeader({ user, progress }: ProfileHeaderProps) {
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Real app: Upload to Supabase Storage, then update user profile
    // Mocking upload delay
    setTimeout(() => {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
      setIsUploading(false);
    }, 1000);
  };

  const progressPercent = Math.min(100, Math.max(0, (progress.total_xp / progress.next_level_xp) * 100));

  return (
    <div className="bg-bg-secondary rounded-2xl p-6 md:p-8 border border-border-subtle flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm">
      <div className="relative group shrink-0">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-bg-tertiary bg-bg-tertiary shadow-md relative">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={user.name || 'Profile'} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-text-tertiary">
              {(user.name || user.email).charAt(0).toUpperCase()}
            </div>
          )}
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100"
          >
            {isUploading ? (
              <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-xs font-bold">تغيير الصورة</span>
              </>
            )}
          </button>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange}
        />
      </div>

      <div className="flex-1 text-center md:text-start space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-2">
              {user.name || 'مستخدم ياعيل'}
              <button className="text-text-tertiary hover:text-primary-500 transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
            </h1>
            <p className="text-text-secondary mt-1">{user.email}</p>
            <p className="text-xs text-text-tertiary mt-1" dir="ltr">
              انضم في {new Date(user.created_at).toLocaleDateString('ar', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          
          <div className="bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 px-4 py-2 rounded-xl text-center">
            <p className="text-sm font-bold">المستوى {progress.level} — {progress.title}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-text-secondary">
            <span>{progress.total_xp.toLocaleString()} XP</span>
            <span>للمستوى التالي: {progress.next_level_xp.toLocaleString()} XP</span>
          </div>
          <div className="h-3 w-full bg-bg-tertiary rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-primary-500 transition-all duration-1000 ease-out relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
