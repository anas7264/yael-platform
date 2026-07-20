import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'لوحة المتصدرين — يَعَل',
  description: 'تنافس مع الطلاب الآخرين وتصدر قائمة أفضل المستعدين لامتحان ياعيل.',
  openGraph: {
    title: 'لوحة المتصدرين — يَعَل',
    description: 'تنافس مع الطلاب الآخرين وتصدر قائمة أفضل المستعدين لامتحان ياعيل.',
  },
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
