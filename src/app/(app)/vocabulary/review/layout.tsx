import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'مراجعة المفردات — يَعَل',
  description: 'جلسة مراجعة المفردات العبرية بنظام FSRS الذكي — راجع الكلمات المستحقة اليوم.',
  openGraph: {
    title: 'مراجعة المفردات — يَعَل',
    description: 'جلسة مراجعة المفردات العبرية بنظام FSRS الذكي — راجع الكلمات المستحقة اليوم.',
  },
};

export default function VocabReviewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
