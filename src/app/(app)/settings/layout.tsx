import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الإعدادات — يَعَل',
  description: 'إدارة إعدادات حسابك في منصة ياعيل — الإشعارات، الثيم، وأهداف الدراسة.',
  openGraph: {
    title: 'الإعدادات — يَعَل',
    description: 'إدارة إعدادات حسابك في منصة ياعيل — الإشعارات، الثيم، وأهداف الدراسة.',
  },
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
