"use client";

import { Suspense } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  // Temporarily disable authentication for demo
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {children}
    </Suspense>
  );
}
