import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Emergency Dispatch',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
