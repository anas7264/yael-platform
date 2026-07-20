import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الامتحان التجريبي — يَعَل',
  description: 'امتحان تجريبي محاكي لياعيل — اختبر مستواك في بيئة حقيقية.',
  openGraph: {
    title: 'الامتحان التجريبي — يَعَل',
    description: 'امتحان تجريبي محاكي لياعيل — اختبر مستواك في بيئة حقيقية.',
  },
};

export default function ExamSessionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
