import { LoadingSpinner } from '@/components/shared/loading';

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0B132B]">
      <LoadingSpinner text="Initializing Luminous AI Core..." />
    </div>
  );
}
