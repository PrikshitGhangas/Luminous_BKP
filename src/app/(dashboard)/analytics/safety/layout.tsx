import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Safety Analytics',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
