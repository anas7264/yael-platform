import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'نتائج الامتحان — يَعَل',
  description: 'تقرير مفصل لنتائج امتحانك التجريبي في ياعيل مع تحليل الأداء لكل قسم.',
  openGraph: {
    title: 'نتائج الامتحان — يَعَل',
    description: 'تقرير مفصل لنتائج امتحانك التجريبي في ياعيل مع تحليل الأداء لكل قسم.',
  },
};

export default function ExamResultsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
