import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Member Profile',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
