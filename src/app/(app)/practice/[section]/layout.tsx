import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'التمرين — يَعَل',
  description: 'تدرب على أسئلة ياعيل المتكيفة مع مستواك في جلسة تفاعلية.',
  openGraph: {
    title: 'التمرين — يَعَل',
    description: 'تدرب على أسئلة ياعيل المتكيفة مع مستواك في جلسة تفاعلية.',
  },
};

export default function PracticeSectionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
