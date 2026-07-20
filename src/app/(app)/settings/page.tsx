'use client';

import { useState } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Moon from 'lucide-react/dist/esm/icons/moon';
import Sun from 'lucide-react/dist/esm/icons/sun';
import Monitor from 'lucide-react/dist/esm/icons/monitor';
import Bell from 'lucide-react/dist/esm/icons/bell';
import User from 'lucide-react/dist/esm/icons/user';
import Lock from 'lucide-react/dist/esm/icons/lock';
import Target from 'lucide-react/dist/esm/icons/target';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  
  // States
  const [targetScore, setTargetScore] = useState<number>(120);
  const [studyTime, setStudyTime] = useState<number>(30);
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  
  const [notifications, setNotifications] = useState({
    daily: true,
    streak: true,
    badges: true,
    weekly: false,
  });

  const [account, setAccount] = useState({
    name: 'مستخدم ياعيل',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSave = async (section: string) => {
    setIsSaving(true);
    setToast(null);

    try {
      const payload: Record<string, string | number | boolean> = {};
      
      if (section === 'preferences') {
        payload.target_score = targetScore;
        payload.study_time = studyTime;
        payload.level = level;
      } else if (section === 'account') {
        payload.name = account.name;
        if (account.newPassword) {
          if (account.newPassword !== account.confirmPassword) {
            throw new Error('كلمة المرور الجديدة غير متطابقة');
          }
          payload.newPassword = account.newPassword;
        }
      }

      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'حدث خطأ أثناء الحفظ');
      
      setToast({ message: data.message || 'تم الحفظ بنجاح', type: 'success' });
      if (section === 'account') {
        setAccount(prev => ({ ...prev, oldPassword: '', newPassword: '', confirmPassword: '' }));
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setToast({ message: err.message, type: 'error' });
      } else {
        setToast({ message: 'حدث خطأ غير متوقع', type: 'error' });
      }
    } finally {
      setIsSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-32 animate-fade-in relative">
      <div>
        <h1 className="text-3xl font-bold mb-2">الإعدادات</h1>
        <p className="text-text-secondary">خصص تجربتك في منصة ياعيل وتتبع تقدمك بطريقتك.</p>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full text-sm font-bold shadow-lg animate-slide-up ${
          toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Appearance */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-primary-500" />
          المظهر
        </h2>
        
        <div className="flex items-center justify-between p-4 bg-bg-tertiary rounded-xl border border-border-subtle">
          <div>
            <p className="font-bold">الوضع الليلي</p>
            <p className="text-xs text-text-tertiary">تغيير واجهة التطبيق بين الوضع الفاتح والداكن</p>
          </div>
          <button
            onClick={toggleTheme}
            className="relative inline-flex h-8 w-14 items-center rounded-full bg-primary-500/20 transition-colors"
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-primary-500 transition-transform ${
                theme === 'dark' ? 'translate-x-1' : 'translate-x-7'
              } flex items-center justify-center`}
            >
              {theme === 'dark' ? <Moon className="w-3 h-3 text-white" /> : <Sun className="w-3 h-3 text-white" />}
            </span>
          </button>
        </div>
      </Card>

      {/* Study Preferences */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-500" />
            تفضيلات الدراسة
          </h2>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => handleSave('preferences')}
            disabled={isSaving}
          >
            حفظ التغييرات
          </Button>
        </div>

        <div className="space-y-4 p-4 bg-bg-tertiary rounded-xl border border-border-subtle">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="font-bold">الدرجة المستهدفة</p>
              <p className="text-xs text-text-tertiary">من 80 إلى 150 درجة</p>
            </div>
            <span className="text-2xl font-bold text-primary-500">{targetScore}</span>
          </div>
          <input 
            type="range" 
            min="80" 
            max="150" 
            value={targetScore} 
            onChange={(e) => setTargetScore(Number(e.target.value))}
            className="w-full accent-primary-500"
          />
        </div>

        <div className="space-y-4 p-4 bg-bg-tertiary rounded-xl border border-border-subtle">
          <div>
            <p className="font-bold">وقت الدراسة اليومي</p>
            <p className="text-xs text-text-tertiary">المدة التي تنوي قضاءها يومياً</p>
          </div>
          <div className="flex gap-2">
            {[15, 30, 45, 60].map(mins => (
              <button
                key={mins}
                onClick={() => setStudyTime(mins)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${
                  studyTime === mins 
                    ? 'bg-primary-500 text-white border-primary-500 shadow-md' 
                    : 'bg-bg-primary border-border-subtle text-text-secondary hover:border-primary-500/50'
                }`}
              >
                {mins} دقيقة
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 p-4 bg-bg-tertiary rounded-xl border border-border-subtle">
          <div>
            <p className="font-bold">المستوى الحالي (تقريبي)</p>
            <p className="text-xs text-text-tertiary">يساعدنا في تكييف مستوى الأسئلة</p>
          </div>
          <select 
            value={level}
            onChange={(e) => setLevel(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
            className="w-full bg-bg-primary border border-border-subtle rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            <option value="beginner">مبتدئ (تحت 90)</option>
            <option value="intermediate">متوسط (90 - 110)</option>
            <option value="advanced">متقدم (فوق 110)</option>
          </select>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary-500" />
          الإشعارات
        </h2>
        <div className="space-y-2">
          {[
            { id: 'daily', label: 'تذكير يومي بالدراسة', desc: 'إشعار في وقت دراستك المفضل' },
            { id: 'streak', label: 'تحذير فقدان سلسلة الأيام', desc: 'عندما توشك على فقدان تقدمك اليومي' },
            { id: 'badges', label: 'الأوسمة والإنجازات الجديدة', desc: 'عند حصولك على وسام جديد' },
            { id: 'weekly', label: 'التقرير الأسبوعي', desc: 'ملخص لتقدمك وأدائك كل أسبوع' },
          ].map(item => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-bg-tertiary rounded-xl border border-border-subtle">
              <div>
                <p className="font-bold">{item.label}</p>
                <p className="text-xs text-text-tertiary">{item.desc}</p>
              </div>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof prev] }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications[item.id as keyof typeof notifications] ? 'bg-primary-500' : 'bg-border-strong'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications[item.id as keyof typeof notifications] ? 'translate-x-1' : 'translate-x-6'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Account */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-primary-500" />
            الحساب
          </h2>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => handleSave('account')}
            disabled={isSaving}
          >
            حفظ الحساب
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-text-secondary mb-2">الاسم</label>
            <input 
              type="text" 
              value={account.name}
              onChange={e => setAccount(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-bg-tertiary border border-border-subtle rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="pt-4 border-t border-border-subtle space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <Lock className="w-4 h-4 text-text-tertiary" />
              تغيير كلمة المرور
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-2">كلمة المرور الجديدة</label>
                <input 
                  type="password"
                  value={account.newPassword}
                  onChange={e => setAccount(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full bg-bg-tertiary border border-border-subtle rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-2">تأكيد كلمة المرور</label>
                <input 
                  type="password"
                  value={account.confirmPassword}
                  onChange={e => setAccount(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full bg-bg-tertiary border border-border-subtle rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border-subtle flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <h3 className="font-bold text-red-500">حذف الحساب</h3>
            <p className="text-xs text-text-tertiary max-w-sm">
              سيتم حذف جميع بياناتك وتقدمك بشكل نهائي. لا يمكن التراجع عن هذه الخطوة.
            </p>
          </div>
          <Button variant="secondary" className="border-red-500/30 text-red-500 hover:bg-red-500/10">
            <Trash2 className="w-4 h-4 ml-2" />
            حذف الحساب نهائياً
          </Button>
        </div>
      </Card>
    </div>
  );
}
