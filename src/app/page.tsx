'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const WorkflowCanvas = dynamic(
  () => import('@/components/canvas/WorkflowCanvas').then((mod) => mod.WorkflowCanvas),
  {
    ssr: false,
    loading: () => <LoadingScreen />,
  }
);

function LoadingScreen() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#070a12] text-slate-300">
      <div className="flex items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
        <span className="text-sm font-semibold tracking-wide">
          جاري تهيئة استوديو سلاسل الذكاء الاصطناعي...
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoadingScreen />;
  }

  return (
    <main className="h-screen w-screen overflow-hidden">
      <h1 className="sr-only">PF Studio - استوديو سلاسل الذكاء الاصطناعي</h1>
      <WorkflowCanvas />
    </main>
  );
}
