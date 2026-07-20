'use client';

import { useState } from 'react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useToastStore } from '@/stores/useToastStore';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Lock from 'lucide-react/dist/esm/icons/lock';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      addToast({ type: 'error', message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      setIsLoading(false);
      return;
    }

    addToast({ type: 'success', message: 'تم تسجيل الدخول بنجاح' });
    router.push('/dashboard' as Route);
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <Card className="w-full p-8 shadow-2xl border-primary-500/20">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary-500 mb-2">يَعَل</h1>
        <p className="text-text-secondary">تسجيل الدخول إلى حسابك</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          label="البريد الإلكتروني"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          rightIcon={<Mail className="w-5 h-5" />}
        />
        <Input
          label="كلمة المرور"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          rightIcon={<Lock className="w-5 h-5" />}
        />
        
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-primary-500 hover:underline">
            نسيت كلمة المرور؟
          </Link>
        </div>

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          تسجيل الدخول
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-between before:content-[''] before:flex-1 before:h-px before:bg-border-subtle after:content-[''] after:flex-1 after:h-px after:bg-border-subtle">
        <span className="px-4 text-sm text-text-tertiary">أو</span>
      </div>

      <div className="mt-6">
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={handleGoogleLogin}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          المتابعة باستخدام جوجل
        </Button>
      </div>

      <p className="mt-8 text-center text-sm text-text-secondary">
        ليس لديك حساب؟{' '}
        <Link href="/signup" className="text-primary-500 font-medium hover:underline">
          إنشاء حساب جديد
        </Link>
      </p>
    </Card>
  );
}
