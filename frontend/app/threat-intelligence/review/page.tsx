"use client";

import React from 'react';
import { AnalystReviewQueue } from '@/components/analyst/AnalystReviewQueue';
import { Topbar } from '@/components/layout/Topbar';

export default function ReviewQueuePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Topbar />
      <main className="max-w-7xl mx-auto p-6 mt-6">
        <AnalystReviewQueue />
      </main>
    </div>
  );
}
