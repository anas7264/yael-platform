import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'المعلم الذكي — يَعَل',
  description: 'معلمك الخاص المدعوم بالذكاء الاصطناعي — أجب على أسئلتك وفهم العبرية بعمق.',
  openGraph: {
    title: 'المعلم الذكي — يَعَل',
    description: 'معلمك الخاص المدعوم بالذكاء الاصطناعي — أجب على أسئلتك وفهم العبرية بعمق.',
  },
};

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
