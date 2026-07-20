import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'يَعَل — منصة التحضير لامتحان יע"ל',
  description: 'منصة ذكية مدعومة بالذكاء الاصطناعي لتحضير الطلاب العرب لامتحان ياعيل والحصول على 120+ درجة. تعلّم المفردات العبرية، وتدرب على الامتحانات، وتابع تقدمك.',
  openGraph: {
    title: 'يَعَل — منصة التحضير لامتحان יע"ל',
    description: 'منصة ذكية مدعومة بالذكاء الاصطناعي لتحضير الطلاب العرب لامتحان ياعيل والحصول على 120+ درجة.',
    url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yael-platform.vercel.app',
    type: 'website',
    locale: 'ar_SA',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'يَعَل — منصة التحضير لامتحان יע"ל',
  description: 'منصة ذكية مدعومة بالذكاء الاصطناعي لتحضير الطلاب العرب لامتحان ياعيل (יע"ל) والحصول على 120+ درجة.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yael-platform.vercel.app',
  inLanguage: ['ar', 'he'],
  teaches: 'Hebrew Language Proficiency (יע"ל Exam)',
  educationalLevel: 'Higher Education Preparation',
  audience: {
    '@type': 'EducationalAudience',
    educationalRole: 'student',
  },
  offers: {
    '@type': 'Offer',
    category: 'Online Course',
    availability: 'https://schema.org/InStock',
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex min-h-screen items-center justify-center">
        <h1 className="text-4xl font-bold text-primary-500">يَعَل</h1>
      </main>
    </>
  );
}
