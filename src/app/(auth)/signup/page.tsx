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
import User from 'lucide-react/dist/esm/icons/user';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      addToast({ type: 'error', message: 'كلمتا المرور غير متطابقتين' });
      return;
    }

    setIsLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      addToast({ type: 'error', message: error.message || 'حدث خطأ أثناء إنشاء الحساب' });
      setIsLoading(false);
      return;
    }

    addToast({ type: 'success', message: 'تم إنشاء الحساب بنجاح. يرجى تسجيل الدخول.' });
    router.push('/dashboard' as Route);
    router.refresh();
  };

  return (
    <Card className="w-full p-8 shadow-2xl border-primary-500/20">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary-500 mb-2">يَعَل</h1>
        <p className="text-text-secondary">إنشاء حساب جديد</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <Input
          label="الاسم الكامل"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          rightIcon={<User className="w-5 h-5" />}
        />
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
        <Input
          label="تأكيد كلمة المرور"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          rightIcon={<Lock className="w-5 h-5" />}
        />

        <Button type="submit" className="w-full mt-2" size="lg" isLoading={isLoading}>
          إنشاء حساب
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-text-secondary">
        لديك حساب بالفعل؟{' '}
        <Link href={"/login" as Route} className="text-primary-500 font-medium hover:underline">
          تسجيل الدخول
        </Link>
      </p>
    </Card>
  );
}
