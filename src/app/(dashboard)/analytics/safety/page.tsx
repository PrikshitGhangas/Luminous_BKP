'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ScrollText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SafetyAnalyticsDashboard() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/audit-logs');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-6 space-y-3">
      <div className="h-10 w-10 rounded-full bg-[#F0F1EF] border border-[#D6D8D5] flex items-center justify-center text-[#1F2933]">
        <ScrollText className="h-5 w-5" />
      </div>
      <h2 className="text-base font-bold text-[#1F2933]">Safety Logs &amp; Audit Trail</h2>
      <p className="text-xs text-[#667085] max-w-sm">
        Safety analytics and event records have been unified into the System &amp; Safety Logs page.
      </p>
      <Button asChild size="sm" className="bg-[#1F2933] hover:bg-[#111827] text-white text-xs gap-1.5 rounded-lg">
        <Link href="/audit-logs">
          <span>Go to Logs</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  );
}
