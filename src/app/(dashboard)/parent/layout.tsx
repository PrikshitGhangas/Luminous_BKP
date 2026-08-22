import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Parent Portal',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
