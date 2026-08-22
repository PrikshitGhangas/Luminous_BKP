import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Student Directory',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
