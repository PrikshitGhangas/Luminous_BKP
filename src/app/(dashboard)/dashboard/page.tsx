'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/lib/hooks/use-role';
import { LoadingSpinner } from '@/components/shared/loading';

export default function DashboardIndexPage() {
  const router = useRouter();
  const { role, roleMeta } = useRole();

  useEffect(() => {
    if (role && roleMeta) {
      router.replace(roleMeta.defaultPath);
    } else {
      router.replace('/login');
    }
  }, [role, roleMeta, router]);

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <LoadingSpinner text="Loading your dashboard..." />
    </div>
  );
}