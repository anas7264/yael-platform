'use client';

import { useState } from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useToastStore } from '@/stores/useToastStore';
import Mail from 'lucide-react/dist/esm/icons/mail';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const addToast = useToastStore((s) => s.addToast);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsLoading(false);

    if (error) {
      addToast({ type: 'error', message: 'حدث خطأ أثناء إرسال رابط استعادة كلمة المرور' });
      return;
    }

    setIsSent(true);
    addToast({ type: 'success', message: 'تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني' });
  };

  return (
    <Card className="w-full p-8 shadow-2xl border-primary-500/20">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary-500 mb-2">يَعَل</h1>
        <p className="text-text-secondary">استعادة كلمة المرور</p>
      </div>

      {!isSent ? (
        <form onSubmit={handleReset} className="space-y-4">
          <Input
            label="البريد الإلكتروني"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            rightIcon={<Mail className="w-5 h-5" />}
          />

          <Button type="submit" className="w-full mt-2" size="lg" isLoading={isLoading}>
            إرسال رابط الاستعادة
          </Button>
        </form>
      ) : (
        <div className="text-center py-4">
          <p className="text-text-primary mb-4">
            لقد أرسلنا تعليمات استعادة كلمة المرور إلى:
            <br />
            <strong className="text-primary-500">{email}</strong>
          </p>
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Link href={"/login" as Route} className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary-500 transition-colors">
          <ArrowRight className="w-4 h-4 rtl-flip" />
          <span>العودة لتسجيل الدخول</span>
        </Link>
      </div>
    </Card>
  );
}
