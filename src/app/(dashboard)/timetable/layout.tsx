import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Timetable',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
