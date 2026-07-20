'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

export interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  avatar_url: string | null;
  level: number;
  xp: number;
}

interface LeaderboardTableProps {
  users: LeaderboardUser[];
  currentUserId: string;
}

export function LeaderboardTable({ users, currentUserId }: LeaderboardTableProps) {
  const currentUserRef = useRef<HTMLTableRowElement>(null);

  // Focus current user row if present
  useEffect(() => {
    if (currentUserRef.current) {
      // scroll if off-screen, etc.
    }
  }, []);

  if (users.length === 0) return null;

  return (
    <div className="bg-bg-secondary rounded-2xl border border-border-subtle overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-bg-tertiary border-b border-border-subtle text-text-secondary text-sm">
              <th className="py-3 px-4 w-16 text-center font-bold">الترتيب</th>
              <th className="py-3 px-4 font-bold">المستخدم</th>
              <th className="py-3 px-4 font-bold text-center">المستوى</th>
              <th className="py-3 px-4 font-bold" dir="ltr">XP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {users.map((user) => {
              const isCurrentUser = user.id === currentUserId;
              
              return (
                <tr 
                  key={user.id}
                  ref={isCurrentUser ? currentUserRef : null}
                  className={cn(
                    "transition-colors",
                    isCurrentUser 
                      ? "bg-primary-500/10 border-l-4 border-l-primary-500" 
                      : "hover:bg-bg-tertiary/50"
                  )}
                >
                  <td className="py-4 px-4 text-center">
                    <span className={cn(
                      "font-mono font-bold text-sm",
                      isCurrentUser ? "text-primary-600 dark:text-primary-400" : "text-text-secondary"
                    )}>
                      #{user.rank}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0 border-2",
                        isCurrentUser ? "border-primary-500 bg-primary-500/10 text-primary-500" : "border-transparent bg-bg-tertiary text-text-secondary"
                      )}>
                        {user.avatar_url ? (
                          <Image src={user.avatar_url} alt={user.name} width={40} height={40} className="object-cover" />
                        ) : (
                          <span className="font-bold text-sm">{user.name.charAt(0)}</span>
                        )}
                      </div>
                      <span className={cn("font-bold", isCurrentUser && "text-primary-600 dark:text-primary-400")}>
                        {user.name} {isCurrentUser && <span className="text-xs font-normal text-text-tertiary mr-1">(أنت)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-bg-tertiary text-xs font-bold text-text-secondary">
                      {user.level}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-text-secondary" dir="ltr">
                    {user.xp.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
